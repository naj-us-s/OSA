# @pos/ui-theme — Editorial Systems Design

Shared Tailwind v4 (CSS-first) token layer for all three apps.

## Why it exists

One palette/typography source for the whole ecosystem (master prompt §8) while each
app keeps its own character (§8.4):

| App | Character | Key treatment |
|---|---|---|
| Personal OS | editorial control console | cream shell + black instrument panels, numbered index nav |
| Vocab | typography-led | cream reading surfaces, black expression panels |
| Media Tracker | media-first | black canvas, poster-led grids (ref 4), cream chrome |

## Key tokens

- `--color-cream` `#f2efe6` — shell background
- `--color-panel` `#0d0d0d` — instrument panel
- `--color-lime-b` `#d9ff3d` — primary accent (active, primary CTA)
- `--color-coral` `#ff5a45` — secondary accent + hard offset shadows
- `--color-meta` `#8b8b83` — metadata gray
- fonts: `--font-display` (Space Grotesk/Archivo), `--font-mono` (JetBrains/Plex Mono)

## Component classes

- `.panel` / `.panel-lime` — instrument panels
- `.btn-lime` — primary CTA with hard coral offset shadow
- `.nav-active` — lime pill with lime offset shadow
- `.syslabel` — mono uppercase micro-label
- `.display` — editorial display headings
- `.hairline` — thin rules (technical-doc tables)

See `docs/design-refs/README.md` for the reference imagery each token maps to.
