/**
 * Environment loader — MUST be the first import in server.ts.
 *
 * WHY a module: ESM evaluates imports (in declaration order) before the body
 * of the importing module, and `db/client.ts` snapshots process.env.DATABASE_URL
 * into a Pool at import time. Calling dotenv inside server.ts's body would run
 * too late. Keeping this side-effect module first makes the ordering explicit.
 *
 * Two locations: npm scripts run with cwd = apps/api (repo-root .env is two
 * levels up); running from the repo root picks it up via cwd. dotenv never
 * overrides variables already set by the shell (§11 — env wins over files).
 */
import { config as loadEnv } from 'dotenv';
import path from 'node:path';

loadEnv(); // cwd-relative (.env next to wherever the process started)
loadEnv({ path: path.resolve(process.cwd(), '../../.env') }); // repo root fallback
