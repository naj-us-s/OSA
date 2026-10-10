# ADR-004 — External providers behind adapter interfaces

**Status:** accepted (provider choices provisional until integration) · 2026-10-10

## Context

Vocab needs dictionary lookups across languages (§6.4); Media Tracker needs
real metadata search with posters (§7.3). Research (2026-10-10) found:

| Need | Provider | Key | Notes |
|---|---|---|---|
| English definitions | dictionaryapi.dev | no | phonetics, synonyms; license unclear — cache, don't redistribute |
| Any-language words | Wiktionary (MediaWiki API) | no | CC BY-SA attribution required; markup parsing needed |
| Movies/TV | TMDB | **free key** | ~40 req/s, non-commercial attribution required |
| Anime/manga | Jikan | no | unofficial MAL API; rate-limited; ToS caution documented |
| Books | Open Library | no | 1 req/s (3 with UA), cover URLs per-ISBN |
| Anime/manga (avoided) | AniList | no | **terms prohibit competing tracker apps** — excluded |

## Decision

Every provider is wrapped in an **adapter interface** owned by its app module
(`dictionaryAdapter`, `mediaProviderAdapter`) with one implementation per
provider. The API surface the UI consumes is provider-agnostic:

```ts
interface MediaProvider {
  search(query: string, category: MediaCategory): Promise<ProviderResult[]>;
}
```

Missing keys or outages surface as typed errors → honest UI states (loading /
empty / error / rate-limited), never fabricated results (§2.1, §7.3).

## Consequences

- Swapping or adding a provider touches one adapter file.
- Keys live in `.env` only; nothing hardcoded (§11).
- Rate limits: providers are queried server-side (API process), where caching
  and backoff can be added centrally later.
