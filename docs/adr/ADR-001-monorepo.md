# ADR-001 — Lightweight monorepo with npm workspaces

**Status:** accepted · 2026-10-10

## Context

Three apps must share types, design tokens, and API conventions while staying
independently runnable. The target machine is a MacBook Air (8 GB RAM), and the
owner wants to read and learn from the codebase.

## Decision

Use a single repository with npm workspaces: `apps/*` for the four runnable
units, `packages/*` for shared libraries.

## Alternatives considered

- **Multiple git repositories + published packages** — rejected: publishing and
  version-sync overhead for a personal project; cross-repo type changes become
  multi-day chores.
- **pnpm/turbo workspaces** — rejected for V1: npm is preinstalled, zero extra
  tooling, and the repo is small enough that turbo's caching isn't needed yet.

## Consequences

- One `npm install`, one `npm run dev`, one lockfile.
- Cross-package imports resolve directly to TS source (`@pos/shared-types`
  exports `src/index.ts`) — no build step for shared code, fast iteration.
- If the repo grows past ~10 apps, revisit with turbo/nx caching.
