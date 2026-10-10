# Architecture

## Repository structure

```
os/
├── apps/
│   ├── api/              Express backend (port 4000)
│   │   ├── scripts/      db-up.ts · db-migrate.ts (local setup)
│   │   ├── drizzle/      generated SQL migrations
│   │   └── src/
│   │       ├── db/       client.ts (pool) · schema.ts (all tables)
│   │       ├── routes/   tasks.ts · events.ts · summaries.ts
│   │       ├── errors.ts ApiError + safe error middleware
│   │       └── server.ts route mounting, CORS, /api/health
│   ├── personal-os/      OS frontend (5171) — dashboard · tasks · events UI
│   ├── vocab/            Vocab frontend (5172) — library shell
│   └── media-tracker/    Media frontend (5173) — library shell
├── packages/
│   ├── shared-types/     contract types shared by API + frontends
│   ├── ui-theme/         Editorial Systems Design tokens (Tailwind v4)
│   └── config/           tsconfig.base.json
├── docs/                 this documentation + design references
└── .env.example          environment template (real .env is git-ignored)
```

## Application boundaries

The three apps are distinct products in one ecosystem (§2.4):

- **Vocab** owns vocabulary: entries, meanings, reviews, language metadata.
- **Media Tracker** owns media: library items, progress, activity history.
- **Personal OS** owns tasks, events, and dashboard preferences — and
  **reads summaries** from the other two via their published endpoints.

Personal OS must never create competing copies of Vocab/Media data (§4.2).

## Data ownership (schema level)

One database, one schema file, but tables are grouped by owner. Only the owning
app's route module touches its tables:

| Tables | Owner | Consumers |
|---|---|---|
| `tasks`, `events` | Personal OS routes | OS UI |
| `vocab_entries`, `vocab_meanings`, `vocab_reviews` | Vocab routes | Vocab UI, OS (via `/api/vocab/*` only) |
| `media_items`, `media_activity` | Media routes | Media UI, OS (via `/api/media/*` only) |

## API design

Consistent REST conventions:

- All routes under `/api`.
- JSON envelopes: `{ task: ... }`, `{ tasks: [...] }`, `{ error: { code, message } }`.
- Validation with **zod at the boundary**; DB access with Drizzle (parameterized).
- Errors: `ApiError(status, code, message)` → middleware. Internal details are
  logged server-side, never returned (§11).
- Database unreachable → **503 `db_unavailable`**, not a crash (the pool has an
  error listener; the API stays up and recovers when Postgres returns).

### Integration contract (§4.3) — what Vocab/Media give to OS

| Endpoint | Returns | Meaning |
|---|---|---|
| `GET /api/vocab/summary` | `VocabSummary` | total, recent-7d, due-for-review, per-status |
| `GET /api/vocab/recent` | `VocabRecentEntry[]` | last 10 entries |
| `GET /api/media/summary` | `MediaSummary` | totals per status/category, favorites |
| `GET /api/media/recent` | `MediaRecentItem[]` | last 10 added |
| `GET /api/media/in-progress` | `MediaRecentItem[]` | watching/reading, max 10 |

These are **computed live from the owning app's tables** — no mirrors, no
denormalized counters to drift. Missing/zero data yields zeros, and the OS UI
renders loading/empty/error states honestly.

## Data flow

```
Browser (OS UI, :5171)
   │  fetch('/api/...')   ← Vite dev proxy → :4000
   ▼
Express API (:4000)
   ├─ routes/tasks.ts       → tasks table        (OS owns)
   ├─ routes/events.ts      → events table       (OS owns)
   └─ routes/summaries.ts   → vocab_*, media_*   (other apps own;
                                                  read-only aggregate queries)
   ▼
PostgreSQL (personal_os db)
```

Example: creating a task → `POST /api/tasks` → zod validates →
`db.insert(tasks)` → row returned → OS "Today's tasks" panel refetches and
renders it (verified end-to-end during milestone 1).

## Frontend ↔ API

- Each Vite dev server proxies `/api` → `localhost:4000`, so frontends never
  hardcode the API port.
- Shared contract types live in `packages/shared-types` — the single source of
  truth for payload shapes (tasks, summaries, media enums).
- `useResource<T>` hook: fetch + loading/error/ok states (replaces react-query
  for now — fewer deps while contracts settle).

## Key decisions

See `docs/adr/`:

- **ADR-001** — monorepo with npm workspaces.
- **ADR-002** — one Express backend, per-app module boundaries.
- **ADR-003** — Postgres + Drizzle ORM.
- **ADR-004** — provider adapters for external APIs (dictionary, media).

## Future compatibility (§3.3)

- Cross-app references use stable UUIDs (`CrossAppRef` in shared-types).
- New apps add their own route module + tables + summary endpoint; the OS adds
  a widget — no rewrite.
- No event bus, no microservices, no speculative plugin framework.
