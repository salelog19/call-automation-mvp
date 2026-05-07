import { FastifyInstance } from 'fastify';
import { PoolClient } from 'pg';
import { getVisits } from '../services/get-visits.js';
import { withTransaction } from '../db.js';

export async function registerVisitsRoute(app: FastifyInstance) {
  app.get('/visits', async (request, reply) => {
    // Parse and validate query parameters
    const query = request.query as {
      limit?: string;
      offset?: string;
      projectId?: string;
      utmSource?: string;
    };

    // Parse limit and offset with defaults and bounds
    const limit = Math.min(parseInt(query.limit ?? '50', 10), 100); // max 100
    const offset = Math.max(parseInt(query.offset ?? '0', 10), 0);
    if (Number.isNaN(limit) || Number.isNaN(offset)) {
      return reply.status(400).send({ error: 'Invalid limit or offset' });
    }

    // Build filters object (only projectId and utmSource per MVP)
    const filters: {
      projectId?: string;
      utmSource?: string;
    } = {};

    if (query.projectId) {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(query.projectId)) {
        return reply.status(400).send({ error: 'Invalid projectId' });
      }
      filters.projectId = query.projectId;
    }
    if (query.utmSource) filters.utmSource = query.utmSource;

    try {
      return await withTransaction(async (client: PoolClient) => {
        const result = await getVisits(client, filters, { limit, offset });
        reply.send(result);
      });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}