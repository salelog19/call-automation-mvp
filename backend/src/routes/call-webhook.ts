import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import {
  CallProjectNotFoundError,
  handleCallWebhook,
} from '../services/call-webhook.js';

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

    try {
      const result = await handleCallWebhook(parsed.data);

      return {
        attributed: result.attributed,
        callId: result.callId,
        trackingNumberId: result.trackingNumberId,
        visitId: result.visitId,
      };
    } catch (error) {
      if (error instanceof CallProjectNotFoundError) {
        reply.code(404);
        return {
          error: 'project_not_found',
          message: error.message,
        };
      }

      app.log.error({ err: error }, 'Failed to process call webhook');
      reply.code(500);
      return {
        error: 'internal_error',
        message: 'Failed to process call webhook.',
      };
    }
  });
}
