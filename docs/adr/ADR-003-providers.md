# ADR-003 — External provider choices

**Status:** accepted (2026-10-10); research source URLs in
[getting-started.md](../getting-started.md#external-providers)

## Decision

**Dictionary (§6.4):**
- Free Dictionary API (dictionaryapi.dev) for English — no key.
- Wiktionary/MediaWiki API for other languages — no key, CC BY-SA attribution
  required (shown in UI), variable coverage.
- Honest fallback: manual entry + "no dictionary source for this language" state.
  Never fabricate definitions (§2.1, §6.4).

**Media (§7.3):**
- **TMDB** for movies/TV — free key, non-commercial attribution required.
- **Jikan** for anime/manga — no key, unofficial (documented risk).
- **Open Library** for books — no key, 1 req/s.
- **AniList rejected**: its terms prohibit use in competing tracker services.

## Alternatives considered

- Single provider for everything — none covers movies+anime+manga+books.
- Google Books (needs Cloud project + key), OMDb (1k/day free) — deferred.

## Consequences

- All providers sit behind adapters (`apps/api/src/providers/`) so a source can
  be replaced without touching routes or frontend (§7.3).
- TMDB key must be added to `.env` before movie/TV discovery works; until then
  the UI shows a "provider keys missing" state — never fake results.
