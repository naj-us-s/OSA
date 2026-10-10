/**
 * Connection settings come from env (never committed). Defaults match a stock
 * Postgres.app install on macOS — see docs/getting-started.md#database.
 *
 * SECURITY (§11): DATABASE_URL is the single knob for prod deploys; the dev
 * default only ever points at localhost.
 */
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '../../.env', quiet: true });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://localhost:5432/personal_os',
  },
});
