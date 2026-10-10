/**
 * Database connection pool (pg) shared by all request modules.
 *
 * WHY one pool: a single backend (ADR-002) serving three app domains =
 * one process, one pool, no per-module connection storms.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema.js';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://localhost:5432/personal_os',
  max: 5, // kept small: dev machine is a MacBook Air (8 GB RAM)
});

/**
 * A failed DB connection must NEVER take the whole API down (§2.1, §4.3):
 * clients get an honest 503 from the error middleware while the server keeps
 * running and recovers on its own once Postgres is back.
 */
pool.on('error', (err) => {
  console.error('[db] idle client error:', err.message);
});

export const db = drizzle(pool, { schema });
