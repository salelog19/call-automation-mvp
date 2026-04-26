import type { FastifyInstance } from 'fastify';

import { checkDatabaseConnection } from '../db.js';

export function registerHealthRoute(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    try {
      await checkDatabaseConnection();

      return {
        ok: true,
        database: 'up',
      };
    } catch (error) {
      app.log.error({ err: error }, 'Health check failed');

      reply.code(503);
      return {
        ok: false,
        database: 'down',
      };
    }
  });
}
