import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
  assignNumber,
  NoAvailableNumberError,
  ProjectNotFoundError,
} from '../services/assign-number.js';

const assignNumberBodySchema = z.object({
  projectId: z.string().uuid(),
  sessionId: z.string().min(1),
  ymUid: z.string().min(1).optional(),
  landingUrl: z.string().url().optional(),
  referrer: z.string().url().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  visitedAt: z.string().datetime().optional(),
});

export function registerAssignNumberRoute(app: FastifyInstance) {
  app.post('/assign-number', async (request, reply) => {
    const parsed = assignNumberBodySchema.safeParse(request.body);

    if (!parsed.success) {
      reply.code(400);
      return {
        error: 'invalid_request',
        details: parsed.error.flatten(),
      };
    }

    try {
      const result = await assignNumber(parsed.data);

      return {
        assignmentExpiresAt: result.assignmentExpiresAt,
        isExistingAssignment: result.isExistingAssignment,
        shownPhoneNumber: result.shownPhoneNumber,
        trackingNumberId: result.trackingNumberId,
        visitId: result.visitId,
      };
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        reply.code(404);
        return {
          error: 'project_not_found',
          message: error.message,
        };
      }

      if (error instanceof NoAvailableNumberError) {
        reply.code(409);
        return {
          defaultPhone: error.defaultPhone,
          error: 'no_available_number',
          message: 'No active tracking numbers are currently available.',
        };
      }

      app.log.error({ err: error }, 'Failed to assign tracking number');
      reply.code(500);
      return {
        error: 'internal_error',
        message: 'Failed to assign tracking number.',
      };
    }
  });
}
