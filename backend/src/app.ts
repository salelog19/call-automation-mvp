import Fastify from 'fastify';

import { config } from './config.js';
import { registerAssignNumberRoute } from './routes/assign-number.js';
import { registerCallWebhookRoute } from './routes/call-webhook.js';
import { registerHealthRoute } from './routes/health.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: process.env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
            },
          },
    },
  });

  app.get('/', async () => {
    return {
      service: 'call-automation-mvp-backend',
      status: 'ok',
    };
  });

  registerHealthRoute(app);
  registerAssignNumberRoute(app);
  registerCallWebhookRoute(app);

  return app;
}
