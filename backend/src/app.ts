import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';

import { config } from './config.js';
import { registerAssignNumberRoute } from './routes/assign-number.js';
import { registerCallWebhookRoute } from './routes/call-webhook.js';
import { registerHealthRoute } from './routes/health.js';
import { registerGetNumberRoute } from './routes/get-number.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport:
        process.env.NODE_ENV === 'production'
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

  app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/scripts/',
  setHeaders: (res, pathName) => {
    if (pathName.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
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
  registerGetNumberRoute(app);

  return app;
}