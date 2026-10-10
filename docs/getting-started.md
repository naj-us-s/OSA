# Getting Started

> Milestone 1 status: **foundation live**. Personal OS dashboard, task CRUD,
> events CRUD, and the Vocab/Media summary contract are running against a real
> Postgres. Vocab CRUD + dictionary and Media library + discovery are the next
> milestones (see [Incomplete features](#incomplete-features)).

## What the system contains

Four workspaces in one monorepo:

| Workspace | Port | Role |
|---|---|---|
| `apps/api` | 4000 | Single Express backend, one module per app domain |
| `apps/personal-os` | 5171 | Personal OS frontend (dashboard, tasks, events) |
| `apps/vocab` | 5172 | Vocab frontend (library shell — CRUD next milestone) |
| `apps/media-tracker` | 5173 | Media Tracker frontend (library shell — discovery next milestone) |

How they relate: the two other apps **own** their data and hand Personal OS
summary data only through documented API endpoints (`/api/vocab/*`,
`/api/media/*`). Personal OS never reads their tables. See
[architecture.md](architecture.md).

## Install

```bash
npm install
```

## Database

Requirements: [Postgres.app](https://postgres.app) (or any local PostgreSQL ≥ 14).

1. Start Postgres (Postgres.app menu-bar icon → Start).
2. Create the role + database (one-time):
   ```bash
   npm run db:up
   ```
3. Apply migrations (repeat after schema changes):
   ```bash
   npm run db:migrate
   ```
4. Copy `.env.example` → `.env` (already done in this workspace; the file is
   git-ignored — never commit real credentials, §11).

## Run

```bash
npm run dev      # API + all three frontends, one command
```

Open http://localhost:5171 (Personal OS). Sidebar links jump to Vocab (:5172)
and Media (:5173).

## Test / typecheck / build

```bash
npm run test         # Vitest across all workspaces
npm run typecheck    # tsc in every workspace
npm run build        # production bundles (frontends → dist/, API → dist/)
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Panels show `⚠ Vocab unavailable: Request failed (500/503)` | API or Postgres not running | Start Postgres.app, then `npm run dev` |
| `ECONNREFUSED ::1:5432` in API log | Postgres not running | Start Postgres.app |
| `db:up` fails | Postgres not running | Start Postgres.app first |
| Port already in use | A previous dev server survived | `lsof -iTCP:5171 -sTCP:LISTEN` and kill the PID |
| CSS looks unstyled | `@tailwindcss/vite` missing or wrong config | `npm install`, ensure each `vite.config.ts` includes `tailwindcss()` |
| Env vars ignored by API | `.env` missing at repo root | `cp .env.example .env` |

## Providers (external APIs — not yet integrated)

| Need | Chosen provider | Key required? | Status |
|---|---|---|---|
| Dictionary (English) | dictionaryapi.dev | No | Not integrated yet |
| Dictionary (other languages) | Wiktionary API | No (CC BY-SA attribution) | Not integrated yet |
| Movies / TV / anime-as-TV | TMDB | **Yes** (free) | Not integrated yet |
| Anime / manga | Jikan (MyAnimeList) | No | Not integrated yet |
| Books | Open Library | No | Not integrated yet |

No provider key is hardcoded anywhere (§11). When providers land, keys go in
`.env` and setup steps get documented here.

## Incomplete features (honest status)

- Vocab: entry CRUD, dictionary lookup, review interface — schema exists,
  API/UI pending (milestone 2).
- Media: library CRUD, provider search, detail pages, progress — schema exists,
  API/UI pending (milestone 2).
- Personal OS: quick capture, calendar view, settings — API for events exists,
  UI pending.
