import type { PoolClient } from 'pg';

import { config } from '../config.js';
import { withTransaction } from '../db.js';

export type AssignNumberInput = {
  landingUrl?: string;
  projectId: string;
  referrer?: string;
  sessionId: string;
  utmCampaign?: string;
  utmContent?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;
  visitedAt?: string;
  ymUid?: string;
};

export type AssignNumberResult = {
  assignmentExpiresAt: string;
  isExistingAssignment: boolean;
  shownPhoneNumber: string;
  trackingNumberId: string;
  visitId: string;
};

type ActiveVisitRow = {
  assignment_expires_at: Date;
  shown_phone_number: string;
  tracking_number_id: string;
  visit_id: string;
};

type CandidateNumberRow = {
  phone_number: string;
  tracking_number_id: string;
};

type ProjectRow = {
  default_phone: string;
};

export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project ${projectId} not found`);
    this.name = 'ProjectNotFoundError';
  }
}

export class NoAvailableNumberError extends Error {
  constructor(public readonly defaultPhone: string) {
    super('No available tracking number');
    this.name = 'NoAvailableNumberError';
  }
}

export async function assignNumber(input: AssignNumberInput): Promise<AssignNumberResult> {
  return withTransaction(async (client) => {
    const visitedAt = input.visitedAt ? new Date(input.visitedAt) : new Date();
    await lockSessionAssignment(client, input.projectId, input.sessionId);

    const existingAssignment = await findExistingAssignment(client, input.projectId, input.sessionId, visitedAt);

    if (existingAssignment) {
      return {
        assignmentExpiresAt: existingAssignment.assignment_expires_at.toISOString(),
        isExistingAssignment: true,
        shownPhoneNumber: existingAssignment.shown_phone_number,
        trackingNumberId: existingAssignment.tracking_number_id,
        visitId: existingAssignment.visit_id,
      };
    }

    const candidateNumber = await findAvailableTrackingNumber(client, input.projectId, visitedAt);

    if (!candidateNumber) {
      const project = await getProject(client, input.projectId);

      if (!project) {
        throw new ProjectNotFoundError(input.projectId);
      }

      throw new NoAvailableNumberError(project.default_phone);
    }

    const assignmentExpiresAt = new Date(visitedAt.getTime() + config.ASSIGNMENT_WINDOW_MINUTES * 60_000);
    const visit = await createVisit(client, input, candidateNumber, visitedAt, assignmentExpiresAt);

    await client.query(
      `
        update tracking_numbers
        set last_assigned_at = $2
        where id = $1
      `,
      [candidateNumber.tracking_number_id, visitedAt],
    );

    return {
      assignmentExpiresAt: assignmentExpiresAt.toISOString(),
      isExistingAssignment: false,
      shownPhoneNumber: candidateNumber.phone_number,
      trackingNumberId: candidateNumber.tracking_number_id,
      visitId: visit.id,
    };
  });
}

async function lockSessionAssignment(client: PoolClient, projectId: string, sessionId: string): Promise<void> {
  await client.query(
    `
      select pg_advisory_xact_lock(hashtext($1))
    `,
    [`${projectId}:${sessionId}`],
  );
}

async function findExistingAssignment(
  client: PoolClient,
  projectId: string,
  sessionId: string,
  visitedAt: Date,
): Promise<ActiveVisitRow | null> {
  const result = await client.query<ActiveVisitRow>(
    `
      select
        v.id as visit_id,
        v.tracking_number_id,
        v.shown_phone_number,
        v.assignment_expires_at
      from visits v
      where v.project_id = $1
        and v.session_id = $2
        and v.assignment_expires_at > $3
      order by v.visited_at desc
      limit 1
      for update
    `,
    [projectId, sessionId, visitedAt],
  );

  return result.rows[0] ?? null;
}

async function findAvailableTrackingNumber(
  client: PoolClient,
  projectId: string,
  visitedAt: Date,
): Promise<CandidateNumberRow | null> {
  const result = await client.query<CandidateNumberRow>(
    `
      select
        tn.id as tracking_number_id,
        tn.phone_number
      from tracking_numbers tn
      where tn.project_id = $1
        and tn.status = 'active'
        and not exists (
          select 1
          from visits v
          where v.project_id = tn.project_id
            and v.tracking_number_id = tn.id
            and v.assignment_expires_at > $2
        )
      order by tn.last_assigned_at asc nulls first, tn.created_at asc
      limit 1
      for update skip locked
    `,
    [projectId, visitedAt],
  );

  return result.rows[0] ?? null;
}

async function getProject(client: PoolClient, projectId: string): Promise<ProjectRow | null> {
  const result = await client.query<ProjectRow>(
    `
      select default_phone
      from projects
      where id = $1
      limit 1
    `,
    [projectId],
  );

  return result.rows[0] ?? null;
}

async function createVisit(
  client: PoolClient,
  input: AssignNumberInput,
  candidateNumber: CandidateNumberRow,
  visitedAt: Date,
  assignmentExpiresAt: Date,
): Promise<{ id: string }> {
  const result = await client.query<{ id: string }>(
    `
      insert into visits (
        project_id,
        tracking_number_id,
        session_id,
        ym_uid,
        landing_url,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        shown_phone_number,
        visited_at,
        assignment_expires_at
      )
      values (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14
      )
      returning id
    `,
    [
      input.projectId,
      candidateNumber.tracking_number_id,
      input.sessionId,
      input.ymUid ?? null,
      input.landingUrl ?? null,
      input.referrer ?? null,
      input.utmSource ?? null,
      input.utmMedium ?? null,
      input.utmCampaign ?? null,
      input.utmTerm ?? null,
      input.utmContent ?? null,
      candidateNumber.phone_number,
      visitedAt,
      assignmentExpiresAt,
    ],
  );

  return result.rows[0];
}
