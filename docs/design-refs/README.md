# Design References — Editorial Systems Design

Source: `designui.docx` (repo root). The document's only text is "The text are no so
visible in this" — the design direction is carried entirely by 6 embedded screenshots,
now extracted to `docs/design-refs/` and reviewed.

## Reference analysis

| File | What it shows | What to take from it |
|---|---|---|
| [image1.png](image1.png) | Personal OS / **Tasks page**, desktop | The canonical app shell: cream sidebar with boxed logo, numbered INDEX nav (`01 DASHBOARD`, `02 TODAY`…), colored "SYSTEMS" links to connected apps, lime/pill active state with hard offset shadow; black top bar with `PERSONAL OS : TASKS` breadcrumb + search; red accent on kicker text (`PLANNING`) and on the NEW TASK button (lime fill, coral hard-offset block shadow); huge display heading; mono small text; content panel = **black panel with lime border**, checkbox rows with strikethrough on completed, hard-gray priority chips. Counted tabs ("All tasks **12**"). |
| [image2.png](image2.png) | iOS app "trove" | Palette proof of black/cream/grays with **acid lime** accents; icon row categories; flower/petal radial data viz; bottom sheet with serif editorial quote typography. |
| [image3.png](image3.png) | Mobile project tracker | Light mobile: pill filter chips, milestone bars under task titles, floating black pill dock; confirms mobile adaptation of the same soft-skeletal language. |
| [image4.png](image4.png) | "Content" gallery on black | **Media Tracker mood**: dark canvas, cover art columns of staggered heights, chapter badges, small caption lines. |
| [image5.png](image5.png) | Dashboard wireframe (rounded gray blocks) | Layout skeleton only: left icon-rail + large main surface + right rail + bottom tiles; rounded-corner blocks, not hard-edged. |
| [image6.png](image6.png) | "Emotional Core Module" spec sheet | The **Technical Documentation layer**: full-black blueprint with thin gray rules, spec tables, feature lists, vector line art, safety-note boxes, "recommended recharge sources" icon row. Use for OS detail/data pages and empty states ("system spec sheet" styling). |

## Synthesis — the design system

**Direction confirmed: Swiss Modernism × Neo-Brutalism × Technical Documentation.**

- **Surfaces are split-tone:** cream (#F1EEE3-ish) shell + **black content panels**. The
  OS reference literally frames task lists as "instrument panels" floating on cream.
- **Hard shadow accent:** buttons and active nav carry a **coral offset block shadow**
  (2–4px translate, no blur); active nav is a lime pill with the same treatment.
- **Editorial typographic scale:** huge display headings (with soft drop shadow), tiny
  mono kickers (red or gray), generous letter-spacing on labels, mono for all metadata.
- **Numbered index navigation** (01, 02…), per-app colored links under "SYSTEMS".
- **Data as instrument:** big numerals ("10 OCT", 12% etc.), counted tabs, progress bars
  as thin lines, petal/radial summaries where counts are complex.
- **Technical-doc details:** thin gray rule tables, spec labels, captioned diagrams,
  barcode-like fine print, safety/notes boxes.
- **Rounding is contextual:** reference 5/3 show softly rounded utility blocks
  (12–16px) while reference 1/6 show hard edges — so cards are rounded-2xl utility
  panels, *buttons/nav/chips are hard or pill-edged*, with brutalist offset shadows.

### Token starting points (to implement in `packages/ui-theme`)

```
--os-bg:        #F2EFE6   cream shell
--os-panel:     #0D0D0D   black instrument panel
--os-panel-k:   #D9FF3D   acid lime (active/border/primary button)
--os-coral:     #FF5A45   secondary accent (kicker text, hard shadows)
--os-ink:       #0D0D0D   text on cream
--os-paper:     #F7F4EA   text on black panels
--os-meta:      #8B8B83   gray metadata
--os-line:      rgba(13,13,13,.12)   hairlines on cream; rgba(255,255,255,.14) on black
font-display:   Space Grotesk / Archivo black-800, tight tracking
font-mono:      JetBrains Mono / IBM Plex Mono, uppercase small labels
```

Per §8.4: **OS = cream shell + black instrument panels**; **Vocab = typography-led on
cream with black reading panels**; **Media Tracker = black canvas, poster-led** (ref 4)
with cream library/utility chrome.
