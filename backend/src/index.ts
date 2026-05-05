import { buildApp } from './app.js';
import { config } from './config.js';

async function main() {
  const app = buildApp();

  try {
    await app.listen({
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : config.HOST,
      port: config.PORT,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
