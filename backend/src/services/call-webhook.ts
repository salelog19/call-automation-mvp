import type { PoolClient } from 'pg';

import { withTransaction } from '../db.js';

export type CallWebhookInput = {
  calledAt: string;
  callStatus?: string;
  clientPhone: string;
  dialedPhoneNumber: string;
  durationSeconds?: number;
  projectId: string;
  providerCallId?: string;
};

export type CallWebhookResult = {
  attributed: boolean;
  callId: string;
  trackingNumberId: string | null;
  visitId: string | null;
};

type ProjectRow = {
  id: string;
};

type TrackingNumberRow = {
  tracking_number_id: string;
};

type VisitMatchRow = {
  tracking_number_id: string;
  visit_id: string;
};

type CallInsertRow = {
  id: string;
};

export class CallProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project ${projectId} not found`);
    this.name = 'CallProjectNotFoundError';
  }
}

export async function handleCallWebhook(input: CallWebhookInput): Promise<CallWebhookResult> {
  return withTransaction(async (client) => {
    const project = await getProject(client, input.projectId);

    if (!project) {
      throw new CallProjectNotFoundError(input.projectId);
    }

    const calledAt = new Date(input.calledAt);
    const trackingNumber = await findTrackingNumberByPhone(client, input.projectId, input.dialedPhoneNumber);
    const visitMatch = trackingNumber
      ? await findVisitForCall(client, input.projectId, trackingNumber.tracking_number_id, calledAt)
      : null;

    const insertedCall = await insertCall(client, input, calledAt, {
      trackingNumberId: trackingNumber?.tracking_number_id ?? null,
      visitId: visitMatch?.visit_id ?? null,
    });

    return {
      attributed: Boolean(visitMatch),
      callId: insertedCall.id,
      trackingNumberId: trackingNumber?.tracking_number_id ?? null,
      visitId: visitMatch?.visit_id ?? null,
    };
  });
}

async function getProject(client: PoolClient, projectId: string): Promise<ProjectRow | null> {
  const result = await client.query<ProjectRow>(
    `
      select id
      from projects
      where id = $1
      limit 1
    `,
    [projectId],
  );

  return result.rows[0] ?? null;
}

async function findTrackingNumberByPhone(
  client: PoolClient,
  projectId: string,
  dialedPhoneNumber: string,
): Promise<TrackingNumberRow | null> {
  const result = await client.query<TrackingNumberRow>(
    `
      select tn.id as tracking_number_id
      from tracking_numbers tn
      where tn.project_id = $1
        and tn.phone_number = $2
      limit 1
    `,
    [projectId, dialedPhoneNumber],
  );

  return result.rows[0] ?? null;
}

async function findVisitForCall(
  client: PoolClient,
  projectId: string,
  trackingNumberId: string,
  calledAt: Date,
): Promise<VisitMatchRow | null> {
  const result = await client.query<VisitMatchRow>(
    `
      select
        v.id as visit_id,
        v.tracking_number_id
      from visits v
      where v.project_id = $1
        and v.tracking_number_id = $2
        and $3 between v.visited_at and v.assignment_expires_at
      order by v.visited_at desc
      limit 1
    `,
    [projectId, trackingNumberId, calledAt],
  );

  return result.rows[0] ?? null;
}

async function insertCall(
  client: PoolClient,
  input: CallWebhookInput,
  calledAt: Date,
  attribution: {
    trackingNumberId: string | null;
    visitId: string | null;
  },
): Promise<CallInsertRow> {
  const result = await client.query<CallInsertRow>(
    `
      insert into calls (
        project_id,
        visit_id,
        tracking_number_id,
        provider_call_id,
        called_at,
        client_phone,
        dialed_phone_number,
        call_status,
        duration_seconds
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      returning id
    `,
    [
      input.projectId,
      attribution.visitId,
      attribution.trackingNumberId,
      input.providerCallId ?? null,
      calledAt,
      input.clientPhone,
      input.dialedPhoneNumber,
      input.callStatus ?? null,
      input.durationSeconds ?? null,
    ],
  );

  return result.rows[0];
}
