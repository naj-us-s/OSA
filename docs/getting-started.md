# Getting Started

> The system contains three apps — **Personal OS** (tasks/events/dashboard),
> **Vocab** (multilingual vocabulary), **Media Tracker** (media library) — plus one
> shared API and one shared Postgres database. See [architecture.md](architecture.md)
> for how they relate.

## Prerequisites

| Tool | Version used | Notes |
|---|---|---|
| Node.js | ≥ 20 (tested on 26) | `node --version` |
| npm | ≥ 10 | ships with Node |
| PostgreSQL | 18 (Postgres.app) | see below |

## Install

```bash
npm install          # installs all workspaces
cp .env.example .env # local database URL (never commit .env)
```

## Database

Postgres.app must be running (click its menu-bar icon → **Start**).

```bash
npm run db:up        # once: creates role + `personal_os` database
npm run db:migrate   # applies schema migrations (apps/api/drizzle/*.sql)
```

`db:up` prints the `DATABASE_URL` it expects — it matches `.env.example`.

## Run

```bash
npm run dev          # starts everything in parallel:
                     #   API          → http://localhost:4000
                     #   Personal OS  → http://localhost:5171
                     #   Vocab        → http://localhost:5172
                     #   Media        → http://localhost:5173
```

Individual apps: `npm run dev:api`, `npm run dev:os`, `npm run dev:vocab`,
`npm run dev:media`.

## Test / typecheck / build

```bash
npm run test         # Vitest across workspaces
npm run typecheck    # tsc --noEmit for every workspace
npm run build        # production bundles (apps/*/dist)
```

## External providers (§7.3, §6.4)

| Provider | Used for | Key needed? | Status |
|---|---|---|---|
| Free Dictionary API (dictionaryapi.dev) | English dictionary lookup | no | adapter planned, milestone 3 |
| Wiktionary (MediaWiki API) | other languages | no | adapter planned, milestone 3 |
| TMDB | movies/TV/anime-as-TV metadata | **yes — free key** | not configured |
| Jikan (MyAnimeList) | anime/manga metadata | no | adapter planned, milestone 4 |
| Open Library | books | no | adapter planned, milestone 4 |

TMDB key: create an account at themoviedb.org → Settings → API → copy the API key
(v3 auth) into `.env` as `TMDB_API_KEY=`. Without it, media discovery shows the
"provider keys missing" panel — the rest of Media Tracker works offline.

## Incomplete features (honest status, §9.3)

- Personal OS: Today/Calendar/Settings screens (APIs exist for events/tasks).
- Vocab: entry CRUD + dictionary lookup (schema + summary endpoints exist).
- Media Tracker: discovery/library CRUD (schema + summary endpoints exist).
- Review scheduling is a simple never-reviewed heuristic, not spaced repetition.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ECONNREFUSED ::1:5432` in API log | Postgres.app not running | start Postgres.app, retry |
| Dashboard panels show red error text | API down | `npm run dev:api`; panels recover on refetch |
| `503 db_unavailable` responses | DB stopped mid-session | start Postgres; API recovers without restart |
| `permission denied for table …` | tables owned by the wrong role (migrations ran outside `.env`) | `npm run db:up` (re-grants), then restart the API |
| `db:up` fails | no permission on `postgres` DB | run Postgres.app's default init once |
| Port already in use | stale dev server | `lsof -iTCP:5171 -sTCP:LISTEN` then kill that PID |
| `@theme blocks must only contain custom properties` | Tailwind v4 syntax error in `packages/ui-theme` | edit tokens inside `@theme { }`, base rules in `@layer base { }` |
