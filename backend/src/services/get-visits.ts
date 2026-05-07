import { PoolClient } from 'pg';

export type VisitRow = {
  id: string;
  project_id: string;
  session_id: string;
  ym_uid: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  landing_url: string | null;
  referrer: string | null;
  shown_phone_number: string;
  visited_at: Date;
  assignment_expires_at: Date;
  created_at: Date;
};

export type VisitsResponse = {
  visits: Array<{
    id: string;
    projectId: string;
    sessionId: string;
    ymUid: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
    landingUrl: string | null;
    referrer: string | null;
    shownPhoneNumber: string;
    visitedAt: string;
    assignmentExpiresAt: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

export async function getVisits(
  client: PoolClient,
  filters: {
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  },
  pagination: {
    limit: number;
    offset: number;
  }
): Promise<VisitsResponse> {
  // Build WHERE clause and values for parameterized query
  const whereConditions: string[] = [];
  const values: any[] = [];
  let valueIndex = 1;

  if (filters.projectId) {
    whereConditions.push(`project_id = $${valueIndex++}`);
    values.push(filters.projectId);
  }
  if (filters.dateFrom) {
    whereConditions.push(`visited_at >= $${valueIndex++}`);
    values.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    whereConditions.push(`visited_at <= $${valueIndex++}`);
    values.push(filters.dateTo);
  }
  if (filters.utmSource) {
    whereConditions.push(`utm_source = $${valueIndex++}`);
    values.push(filters.utmSource);
  }
  if (filters.utmMedium) {
    whereConditions.push(`utm_medium = $${valueIndex++}`);
    values.push(filters.utmMedium);
  }
  if (filters.utmCampaign) {
    whereConditions.push(`utm_campaign = $${valueIndex++}`);
    values.push(filters.utmCampaign);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count query
  const countResult = await client.query(
    `SELECT COUNT(*) FROM visits ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Data query
  const dataResult = await client.query(
    `
      SELECT
        id,
        project_id,
        session_id,
        ym_uid,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        landing_url,
        referrer,
        shown_phone_number,
        visited_at,
        assignment_expires_at
      FROM visits
      ${whereClause}
      ORDER BY visited_at DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `,
    [...values, pagination.limit, pagination.offset]
  );

  // Map rows to response format (camelCase and ISO strings)
  const visits = dataResult.rows.map(row => ({
    id: row.id,
    projectId: row.project_id,
    sessionId: row.session_id,
    ymUid: row.ym_uid ?? null,
    utmSource: row.utm_source ?? null,
    utmMedium: row.utm_medium ?? null,
    utmCampaign: row.utm_campaign ?? null,
    utmTerm: row.utm_term ?? null,
    utmContent: row.utm_content ?? null,
    landingUrl: row.landing_url ?? null,
    referrer: row.referrer ?? null,
    shownPhoneNumber: row.shown_phone_number,
    visitedAt: row.visited_at.toISOString(),
    assignmentExpiresAt: row.assignment_expires_at.toISOString(),
  }));

  return {
    visits,
    pagination: {
      total,
      limit: pagination.limit,
      offset: pagination.offset
    }
  };
}