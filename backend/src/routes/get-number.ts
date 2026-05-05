import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  assignNumber,
  type { AssignNumberInput, AssignNumberResult },
} from '../services/assign-number.js';

const getNumberQuerySchema = z.object({
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
});

export function registerGetNumberRoute(app: FastifyInstance) {
  app.get<{
    Querystring: z.infer<typeof getNumberQuerySchema>
  }>('/api/number', async (request, reply) => {
    const parsed = getNumberQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      reply.code(400);
      return {
        error: 'invalid_request',
        details: parsed.error.flatten(),
      };
    }

    const input: AssignNumberInput = {
      projectId: parsed.data.projectId,
      sessionId: parsed.data.sessionId,
      ymUid: parsed.data.ymUid,
      landingUrl: parsed.data.landingUrl,
      referrer: parsed.data.referrer,
      utmSource: parsed.data.utmSource,
      utmMedium: parsed.data.utmMedium,
      utmCampaign: parsed.data.utmCampaign,
      utmTerm: parsed.data.utmTerm,
      utmContent: parsed.data.utmContent,
    };

    try {
      const result = await assignNumber(input);

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

// Re-export errors for use in route
export { ProjectNotFoundError, NoAvailableNumberError } from '../services/assign-number.js';
