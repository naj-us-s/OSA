/**
 * Media Tracker — library view, V1 foundation.
 *
 * Media-first identity (§8.4, ref image4): black canvas, cover-art column grid,
 * small captions. Live summary from the real API; per-item library views land in
 * milestone 2 (docs/getting-started.md#incomplete-features).
 */
import { useEffect, useState } from 'react';

import type { MediaSummary } from '@pos/shared-types';

export function App() {
  const [summary, setSummary] = useState<MediaSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/media/summary')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`API ${r.status}`))))
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  const CATEGORIES = [
    ['MOVIES', 'movie'],
    ['TV SERIES', 'tv'],
    ['ANIME', 'anime'],
    ['MANGA', 'manga'],
    ['BOOKS', 'book'],
  ] as const;

  return (
    <div className="min-h-screen bg-panel text-paper">
      <header className="border-b border-line-l px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-mono font-bold text-sm">MEDIA</span>
          <span className="syslabel text-meta-dark">LIBRARY · DISCOVERY · PROGRESS</span>
        </div>
        <a href="http://localhost:5171" className="syslabel text-coral hover:underline">
          ← PERSONAL OS
        </a>
      </header>

      <main className="px-6 md:px-10 py-10">
        <div className="syslabel text-lime-b">LIBRARY</div>
        <h1 className="display text-5xl md:text-7xl mt-1 mb-8 text-paper">Your shelf.</h1>

        {/* category index tabs — numbered, editorial (§8.1) */}
        <nav className="flex gap-6 border-b border-line-l pb-3 mb-10 flex-wrap">
          {CATEGORIES.map(([label, key], i) => (
            <span key={key} className="syslabel text-meta-dark">
              <span className="text-meta">{String(i + 1).padStart(2, '0')}</span> · {label}
              {summary && <span className="text-lime-b ml-2">{summary.byCategory[key]}</span>}
            </span>
          ))}
        </nav>

        {error && <p className="text-coral font-mono text-sm">⚠ {error}</p>}
        {!summary && !error && <p className="text-meta-dark">Opening the library…</p>}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {[
              ['SAVED', summary.totalItems],
              ['IN PROGRESS', summary.inProgress],
              ['PLAN TO CONSUME', summary.planned],
              ['COMPLETED', summary.completed],
            ].map(([label, n]) => (
              <div key={label as string} className="panel-2 rounded-2xl bg-panel-2 p-5">
                <div className="display text-4xl text-paper">{n as number}</div>
                <div className="syslabel text-meta-dark mt-1">{label as string}</div>
              </div>
            ))}
          </div>
        )}

        <div className="panel p-10 text-center">
          <div className="syslabel text-lime-b mb-2">DISCOVERY MODULE — PENDING PROVIDER KEYS</div>
          <p className="text-meta">
            Search will connect to TMDB / Jikan / Open Library through provider adapters
            once API keys are configured (see docs/getting-started.md#providers).
          </p>
        </div>
      </main>
    </div>
  );
}
