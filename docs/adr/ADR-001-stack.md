# ADR-001 — Stack selection

**Status:** accepted (2026-10-10)

## Context

Master prompt §4.1: React/TS/Vite, Tailwind, Express, PostgreSQL, Vitest;
MacBook Air 8 GB; no heavy infra; no paid AI for core functions.

## Decision

- React 18 + TypeScript + Vite 5, Tailwind CSS **v4** (CSS-first `@theme` config).
- Express 4 (familiar, small) + **Drizzle ORM** for typed SQL.
- Vitest everywhere (one test runner across workspaces).
- npm workspaces (Node 26 ships npm 11; no extra tooling needed).

## Alternatives considered

- **Prisma** — excellent DX, but a heavier engine binary and codegen step; Drizzle
  keeps SQL visible and typechecks queries without a generate step. Trivially
  swappable later if Prisma's workflow is preferred.
- **Next.js full-stack** — SSR unnecessary for a local personal dashboard; adds
  framework coupling the prompt doesn't need.
- **PostgreSQL → SQLite** — rejected by user decision; matches Postgres.app
  already installed, keeps production parity.

## Consequences

- Migrations are plain SQL files under `apps/api/drizzle/` — reviewable, portable.
- Tailwind v4 requires tokens inside `@theme { }` only (learned the hard way;
  see troubleshooting in getting-started.md).
