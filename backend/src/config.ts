import { z } from 'zod';

const envSchema = z.object({
  ASSIGNMENT_WINDOW_MINUTES: z.coerce.number().int().positive().default(30),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export const config = envSchema.parse(process.env);
