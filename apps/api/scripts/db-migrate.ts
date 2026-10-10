/**
 * db:migrate — apply pending Drizzle migrations.
 * Thin wrapper over drizzle-kit so `npm run db:migrate` works from the repo root.
 */
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['drizzle-kit', 'migrate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (r.status !== 0) {
  console.error('✗ migration failed — check DATABASE_URL and that Postgres is running.');
  process.exit(r.status ?? 1);
}
