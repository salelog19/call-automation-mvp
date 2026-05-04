import { Pool, type PoolClient } from 'pg';

import { config } from './config.js';

function shouldUseSsl(databaseUrl: string): boolean {
  const lower = databaseUrl.toLowerCase();
  return lower.includes('supabase.com') || lower.includes('sslmode=require');
}

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: shouldUseSsl(config.DATABASE_URL)
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('select 1');
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const result = await callback(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
