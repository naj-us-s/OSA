# ADR-002 — One backend with module boundaries (not microservices)

**Status:** accepted (2026-10-10)

## Context

§3.3 rule 10: no microservice/event-bus/platform unless real requirements
justify it. §4.3: Personal OS must still communicate through *explicit
interfaces*, not another app's internals.

## Decision

A single Express app in `apps/api` hosting every domain, with hard boundaries:

1. Routes grouped per domain (`routes/tasks.ts`, `routes/summaries.ts`…).
2. Tables owned per domain (prefix `vocab_*`, `media_*`), documented in
   `db/schema.ts`.
3. Cross-domain access happens **through the HTTP contract** even though
   everything is in one process — frontends never import another domain's code.
4. The integration contract (`/api/vocab/summary` etc.) is documented as
   stable in `docs/architecture.md`.

## Alternatives considered

- **Three separate services** — operational cost (3 processes, ports, deploy
  units) with zero benefit at single-user scale; violates §3.3 rule 10.
- **Shared DB views for OS summaries** — faster, but makes Personal OS read
  other apps' internals directly, breaking the ownership boundary (§4.2).

## Consequences

- One `npm run dev` starts everything; one pool, one migration chain.
- Boundary discipline is *social* (code review + docs), not physical —
  enforced by keeping summary logic in `routes/summaries.ts` only.
- Splitting a domain into its own service later means extracting route +
  tables — the HTTP contract already exists.
