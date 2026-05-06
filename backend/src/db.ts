import { Pool, type PoolClient } from 'pg';

import { config } from './config.js';

function shouldUseSsl(databaseUrl: string): boolean {
  const lower = databaseUrl.toLowerCase();
  return lower.includes('supabase.com') || lower.includes('sslmode=require');
}

// Log DATABASE_URL (mask password)
const databaseUrl = config.DATABASE_URL;
if (databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    // Mask password
    url.password = '***';
    console.log('DATABASE_URL:', url.toString());
  } catch (_) {
    console.log('DATABASE_URL: [present but invalid URL]');
  }
} else {
  console.log('DATABASE_URL: MISSING');
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
    console.log('Executing: select 1');
    await client.query('select 1');
    console.log('Query succeeded: select 1');
  } catch (error) {
    console.error('Database connection check failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  console.log('Acquired database client for transaction');

  try {
    console.log('Executing: BEGIN');
    await client.query('begin');
    console.log('Transaction begun');
    const result = await callback(client);
    console.log('Executing: COMMIT');
    await client.query('commit');
    console.log('Transaction committed');
    return result;
  } catch (error) {
    console.error('Transaction error, rolling back:', error.message);
    await client.query('rollback');
    console.log('Transaction rolled back');
    throw error;
  } finally {
    console.log('Releasing database client');
    client.release();
  }
}
