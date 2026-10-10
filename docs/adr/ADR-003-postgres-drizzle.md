# ADR-003 — PostgreSQL + Drizzle ORM

**Status:** accepted · 2026-10-10

## Context

Master prompt §4.1 asks for PostgreSQL with a maintained TypeScript-compatible
access layer, chosen for simplicity and maintainability. Local Postgres is
already installed (Postgres.app).

## Decision

- **PostgreSQL 18** via Postgres.app locally; `DATABASE_URL` is the single
  production knob.
- **Drizzle ORM** for schema definition, typed queries, and generated SQL
  migrations (`drizzle-kit generate` → `apps/api/drizzle/*.sql`).

## Alternatives considered

- **Prisma** — rejected: heavier runtime client and a codegen step that slows
  iteration; Drizzle's schema-is-TS model is easier to learn from.
- **knex / raw SQL** — rejected: no typed query surface; the prompt wants
  educational, type-safe code.
- **SQLite for dev** — rejected: the chosen DB is available and running; using
  two engines would risk dialect drift in SQL and migrations.

## Consequences

- Schema changes = edit `schema.ts`, run `npm run db:generate`, commit SQL,
  `npm run db:migrate`.
- All queries are parameterized by construction (§11 security).
- Migration files are reviewable SQL — readable for learning purposes.
