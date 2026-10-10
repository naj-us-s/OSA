# Personal OS — monorepo

A personal software ecosystem of three interconnected apps, built with AI-assisted
development so the owner can both **use** it daily and **learn from** the codebase.

| App | Purpose | Emoji-barrier-free path |
|---|---|---|
| **Personal OS** | Central dashboard, tasks, calendar, quick capture | `apps/personal-os` |
| **Vocab** | Multilingual vocabulary & terminology learning | `apps/vocab` |
| **Media Tracker** | Media discovery, bookmarking, tracking, library | `apps/media-tracker` |

## Stack

- Frontend: React + TypeScript + Vite, Tailwind CSS v4
- Backend: single Express API (`apps/api`) with clear per-app module boundaries
- DB: PostgreSQL, accessed with Drizzle ORM (schema in `apps/api/src/db/schema.ts`)
- Tests: Vitest everywhere
- Docs: `docs/` — both project specs and HTML learning guides

## Development

```bash
npm install
npm run dev          # starts API (4000) + all three frontends in parallel
npm run test         # run all workspace tests
npm run typecheck
npm run build
```

Database: PostgreSQL is expected via [Postgres.app]. Run
`npm run db:up` to create the `personal_os` database + user and apply migrations.

## Documentation

- `docs/getting-started.md` — install, run, troubleshoot
- `docs/architecture.md` — repo layout, data ownership, API contracts
- `docs/adr/` — architecture decision records
- `packages/ui-theme/README.md` — the Editorial Systems Design system

## Design references

`docs/design-refs/` — see the README there for the annotated breakdown of the
reference imagery that drives the design system.
