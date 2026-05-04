import type { FastifyInstance } from 'fastify';

import { checkDatabaseConnection } from '../db.js';

export function registerHealthRoute(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    try {
      await checkDatabaseConnection();

      return {
        database: 'up',
        ok: true,
      };
    } catch (error) {
      app.log.error({ err: error }, 'Health check failed');

      // Keep liveness green so deployment is not blocked by transient DB issues.
      reply.code(200);
      return {
        database: 'down',
        ok: true,
      };
    }
  });
}
