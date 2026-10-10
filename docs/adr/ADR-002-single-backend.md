# ADR-002 — One Express backend with per-app module boundaries

**Status:** accepted · 2026-10-10

## Context

§3.3 rule 10 forbids speculative microservices; the apps still need explicit
integration contracts (§4.3) and independent evolution (§2.4).

## Decision

A single Express server (`apps/api`) hosts all domains. Each app gets its own
route module, its own tables, and its own published summary endpoints.
Personal OS talks to Vocab/Media **only** through those endpoints — route
modules never import each other's services.

## Alternatives considered

- **One server per app (microservices)** — rejected: port/process sprawl on a
  8 GB laptop, distributed failures, nothing in V1 justifies the cost.
- **OS reaching directly into other apps' tables for "simplicity"** — rejected:
  that couples schemas and violates data-ownership (§4.2); summary drift would
  be invisible.

## Consequences

- `GET /api/vocab/summary` etc. are stable seams: any app can later move to its
  own process by changing only the frontend's base URL.
- Cross-app queries are read-only aggregates computed live — no caches to
  invalidate, honest zeros when an app is empty.
- Adding future apps (§3) = new route module + tables + summary endpoint.
