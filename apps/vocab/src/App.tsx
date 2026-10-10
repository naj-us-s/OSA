/**
 * Vocab — library view, V1 foundation.
 *
 * Typography-led identity (§8.4): the expression is the hero. Unicode is never
 * transformed — whatever the user typed (Japanese, Cyrillic, emoji) renders as-is
 * (§6.2). Data comes from the real API; until the vocab CRUD endpoints land
 * (next milestone) we render the honest empty state rather than fake data (§2.1).
 */
import { useEffect, useState } from 'react';

interface EntryStub {
  id: string;
  expression: string;
  language: string;
  languageName: string | null;
  entryType: string;
  learningStatus: 'new' | 'learning' | 'known';
}

export function App() {
  const [entries, setEntries] = useState<EntryStub[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // NOTE: /api/vocab/summary is live (integration contract); a full
  // GET /api/vocab/entries endpoint is scheduled for milestone 2 — this UI
  // already renders its real payload shape when it arrives. §9.3: doc stays in
  // sync — see docs/getting-started.md#incomplete-features.
  useEffect(() => {
    fetch('/api/vocab/recent')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`API ${r.status}`))))
      .then((d: { entries: EntryStub[] }) => setEntries(d.entries))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* top bar — mono system header, Vocab edition */}
      <header className="border-b border-line px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-mono font-bold text-sm">VOCAB</span>
          <span className="syslabel text-meta">MULTILINGUAL · TERMINOLOGY · MEMORY</span>
        </div>
        <a href="http://localhost:5171" className="syslabel text-coral hover:underline">
          ← PERSONAL OS
        </a>
      </header>

      <main className="px-6 md:px-10 py-10">
        <div className="syslabel text-coral">LIBRARY</div>
        <h1 className="display text-5xl md:text-7xl mt-1 mb-2">Your words.</h1>
        <p className="text-meta mb-10">Every expression you chose to keep, in any language or script.</p>

        {/* search + filter scaffolding (functional in milestone 2) */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <input
            disabled
            placeholder="Search… (arriving in milestone 2)"
            className="bg-panel text-paper font-mono text-sm px-4 py-2 rounded-full placeholder:text-meta-dark disabled:opacity-60 w-72"
          />
          <span className="syslabel text-meta self-center">FILTERS · LANGUAGE · TYPE · STATUS</span>
        </div>

        {error && <p className="text-coral font-mono text-sm">⚠ {error}</p>}
        {entries === null && !error && <p className="text-meta">Loading your library…</p>}
        {entries?.length === 0 && (
          <div className="panel p-10 max-w-xl">
            <div className="syslabel text-lime-b mb-2">EMPTY LIBRARY</div>
            <p className="text-paper">Nothing saved yet. Capture your first expression from the OS quick capture, or look it up in the dictionary.</p>
          </div>
        )}

        {/* expression cards — typography-led: the expression IS the hero */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {entries?.map((e) => (
            <article key={e.id} className="panel p-6">
              <div className="syslabel text-meta mb-3">
                {e.languageName ?? e.language} · {e.entryType.toUpperCase()}
              </div>
              <div className="text-3xl font-bold text-paper mb-2 break-words">{e.expression}</div>
              <div className="syslabel text-lime-dim">{e.learningStatus.toUpperCase()}</div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
