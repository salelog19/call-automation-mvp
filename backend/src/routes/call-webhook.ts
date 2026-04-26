import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const callWebhookBodySchema = z.object({
  projectId: z.string().uuid(),
  providerCallId: z.string().min(1).optional(),
  calledAt: z.string().datetime(),
  clientPhone: z.string().min(1),
  dialedPhoneNumber: z.string().min(1),
  callStatus: z.string().min(1).optional(),
  durationSeconds: z.coerce.number().int().nonnegative().optional(),
});

export function registerCallWebhookRoute(app: FastifyInstance) {
  app.post('/call-webhook', async (request, reply) => {
    const parsed = callWebhookBodySchema.safeParse(request.body);

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
      message: 'Call webhook processing will be implemented in the next step.',
      payloadPreview: parsed.data,
    };
  });
}
