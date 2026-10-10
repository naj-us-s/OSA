# ADR-004 — Design system: Editorial Systems Design

**Status:** accepted (2026-10-10); reference analysis in
[docs/design-refs/README.md](../design-refs/README.md)

## Decision

One token layer (`packages/ui-theme`) implementing
**Swiss Modernism × Neo-Brutalism × Technical Documentation**:

- cream shell `#f2efe6` + black instrument panels `#0d0d0d`
- acid lime `#d9ff3d` (primary/active), coral `#ff5a45` (secondary + hard
  offset shadows), gray `#8b8b83` (metadata)
- Space Grotesk display + JetBrains Mono system labels
- component classes `.panel`, `.btn-lime`, `.nav-active`, `.syslabel`, `.display`

Per-app identity (§8.4) via *composition*, not separate systems:
- Personal OS: cream shell, numbered index nav, lime-bordered panels.
- Vocab: typography-led cream reading surfaces.
- Media Tracker: black canvas, poster-led grids.

## Alternatives considered

- shadcn/ui + Radix — useful later for dialogs/menus/forms (round 2), but its
  default aesthetic conflicts with the brutalist reference; adopt piecemeal.
- One shared React component library now — premature before the screens exist.

## Consequences

- Every app imports `@pos/ui-theme` CSS; token changes propagate repo-wide.
- Tailwind v4: token edits happen in `@theme`, base rules in `@layer base`.
- Reference images (docs/design-refs) are the visual source of truth; new
  components must cite which reference they follow.
