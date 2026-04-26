import pg from 'pg';

import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('select 1');
  } finally {
    client.release();
  }
}
