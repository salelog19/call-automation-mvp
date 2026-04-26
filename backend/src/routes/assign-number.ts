import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

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

    reply.code(501);
    return {
      error: 'not_implemented',
      message: 'Number assignment logic will be implemented in the next step.',
      payloadPreview: parsed.data,
    };
  });
}
