/**
 * db:up — one-time local setup for Postgres.app installs.
 *
 * Creates a dedicated low-privilege role + database. Runs plain SQL through an
 * admin connection to the maintenance database; no ORM magic here on purpose.
 *
 * Postgres.app ships with your macOS username as superuser over the local
 * socket, so we connect there and set things up.
 */
import { Client } from 'pg';

const DB_NAME = 'personal_os';
const ROLE = 'personal_os_app';

// Dev-only defaults; production must pass a real DATABASE_URL (§11 security).
const ADMIN_URL = process.env.PGADMIN_URL ?? 'postgres://localhost:5432/postgres';

async function main() {
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();

  const roleExists = await admin.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [ROLE]);
  if (roleExists.rowCount === 0) {
    await admin.query(`CREATE ROLE ${ROLE} WITH LOGIN PASSWORD 'local_dev_password'`);
    console.log(`✓ role ${ROLE} created`);
  } else {
    console.log(`• role ${ROLE} already exists`);
  }

  const dbExists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
  if (dbExists.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${DB_NAME} OWNER ${ROLE}`);
    console.log(`✓ database ${DB_NAME} created (owner ${ROLE})`);
  } else {
    console.log(`• database ${DB_NAME} already exists`);
  }

  await admin.end();
  console.log(`\n DATABASE_URL="postgres://${ROLE}:local_dev_password@localhost:5432/${DB_NAME}"`);
  console.log(' (this is a DEV credential — keep it out of committed files)');
}

main().catch((e) => {
  console.error('✗ db:up failed:', e.message);
  console.error('  Is Postgres.app running? (menu-bar elephant icon → "Start")');
  process.exit(1);
});
