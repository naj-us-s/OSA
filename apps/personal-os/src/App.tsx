/**
 * Personal OS — dashboard shell (V1 milestone 1: layout + live integration data).
 *
 * Data flow (§4.1 docs/architecture): this frontend NEVER touches the database.
 * It calls the API (/api/*, proxied in dev) and renders loading/empty/error
 * states honestly (§2.1) — if Vocab or Media Tracker can't answer, we say so.
 */
import { useEffect, useState } from 'react';

import type { MediaSummary, VocabSummary, Task, Event } from '@pos/shared-types';

type LoadState<T> = { state: 'loading' } | { state: 'ok'; data: T } | { state: 'error'; message: string };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/**
 * Minimal hook: fetch once + refetch button. Deliberately not react-query yet —
 * fewer deps while the contracts settle (§2.2 decisions log).
 */
function useResource<T>(url: string): [LoadState<T>, () => void] {
  const [state, setState] = useState<LoadState<T>>({ state: 'loading' });
  const [tick, setTick] = useState(0);
  const refetch = () => setTick((t) => t + 1);
  useEffect(() => {
    let alive = true;
    setState({ state: 'loading' });
    getJson<T>(url)
      .then((data) => alive && setState({ state: 'ok', data }))
      .catch((e) => alive && setState({ state: 'error', message: e.message }));
    return () => {
      alive = false;
    };
  }, [url, tick]);
  return [state, refetch];
}

const PRIORITY_LABELS: Record<string, string> = { low: 'LOW', medium: 'MED', high: 'HIGH', 0: 'LOW', 1: 'MED', 2: 'HIGH' };

const NAV = [
  { n: '01', label: 'Dashboard' },
  { n: '02', label: 'Today' },
  { n: '03', label: 'Tasks' },
  { n: '04', label: 'Calendar' },
] as const;

const SYSTEMS = [
  { label: 'Vocab', href: 'http://localhost:5172', color: '#d9ff3d' },
  { label: 'Media', href: 'http://localhost:5173', color: '#ff5a45' },
] as const;

export function App() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const [vocab] = useResource<VocabSummary & { entries?: unknown[] }>('/api/vocab/summary');
  const [media] = useResource<MediaSummary>('/api/media/summary');
  const [openTasks] = useResource<{ open: Task[] }>('/api/tasks/today');
  const [upcoming] = useResource<{ events: Event[] }>('/api/events/upcoming');

  return (
    <div className="min-h-screen bg-cream text-ink flex">
      {/* ── sidebar: numbered index nav + systems (ref image1) ─────────────── */}
      <aside className="w-56 shrink-0 border-r border-line p-5 flex-col gap-8 hidden md:flex">
        <header>
          <div className="border border-ink px-2 py-1 inline-block font-mono text-xs font-bold">PO</div>
          <div className="syslabel mt-2 text-meta">PERSONAL · OPERATING · SYSTEM</div>
        </header>
        <div>
          <div className="display text-6xl">{new Date().getDate()}</div>
          <div className="syslabel text-coral mt-1">{today.split(',')[0]?.toUpperCase()}</div>
        </div>
        <nav>
          <div className="syslabel text-meta mb-2">INDEX</div>
          <ul className="space-y-1">
            {NAV.map((item, i) => (
              <li key={item.n}>
                <span
                  className={`flex items-baseline gap-3 px-3 py-1.5 font-mono text-xs uppercase tracking-wider ${
                    i === 0 ? 'nav-active' : ''
                  }`}
                >
                  <span className="text-meta-dark">{item.n}</span> {item.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <div className="syslabel text-meta mb-2">SYSTEMS</div>
          <ul className="space-y-1">
            {SYSTEMS.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="block px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-cream-2">
                  <span style={{ color: s.color }}>■</span> {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── main: black instrument panels on cream (ref image1) ───────────── */}
      <main className="flex-1 p-6 md:p-10 space-y-6">
        <div>
          <div className="syslabel text-coral">TODAY</div>
          <h1 className="display text-5xl md:text-6xl mt-1">{today}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <VocabPanel vocab={vocab} />
          <MediaPanel media={media} />
          <TasksPanel tasks={openTasks} />
        </div>

        <div className="panel p-6">
          <div className="syslabel text-lime-b mb-3">UPCOMING SCHEDULE</div>
          {upcoming.state === 'loading' && <p className="text-meta">Loading…</p>}
          {upcoming.state === 'error' && <p className="text-coral">⚠ {upcoming.message}</p>}
          {upcoming.state === 'ok' && upcoming.data.events.length === 0 && (
            <p className="text-meta-dark">No upcoming events — schedule something.</p>
          )}
          {upcoming.state === 'ok' &&
            upcoming.data.events.slice(0, 5).map((e) => (
              <div key={e.id} className="flex justify-between py-2 border-b border-line-l last:border-0">
                <span>{e.title}</span>
                <span className="font-mono text-xs text-meta">
                  {new Date(e.startsAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

function VocabPanel({ vocab }: { vocab: LoadState<VocabSummary> }) {
  return (
    <div className="panel panel-lime p-6">
      <div className="syslabel text-lime-b mb-3">VOCAB — SYSTEM READOUT</div>
      {vocab.state === 'loading' && <p className="text-meta">Contacting Vocab…</p>}
      {vocab.state === 'error' && <p className="text-coral">⚠ Vocab unavailable: {vocab.message}</p>}
      {vocab.state === 'ok' && (
        <>
          <div className="display text-5xl">{vocab.data.totalEntries}</div>
          <div className="syslabel text-meta mt-1">TOTAL ENTRIES</div>
          <div className="mt-3 flex gap-4 font-mono text-xs text-meta-dark">
            <span>NEW {vocab.data.byStatus.new}</span>
            <span>LEARNING {vocab.data.byStatus.learning}</span>
            <span>KNOWN {vocab.data.byStatus.known}</span>
          </div>
        </>
      )}
    </div>
  );
}

function MediaPanel({ media }: { media: LoadState<MediaSummary> }) {
  return (
    <div className="panel panel-lime p-6">
      <div className="syslabel text-lime-b mb-3">MEDIA — SYSTEM READOUT</div>
      {media.state === 'loading' && <p className="text-meta">Contacting Media Tracker…</p>}
      {media.state === 'error' && <p className="text-coral">⚠ Media unavailable: {media.message}</p>}
      {media.state === 'ok' && (
        <>
          <div className="display text-5xl">{media.data.totalItems}</div>
          <div className="syslabel text-meta mt-1">SAVED ITEMS</div>
          <div className="mt-3 flex gap-4 font-mono text-xs text-meta-dark">
            <span>WATCHING {media.data.inProgress}</span>
            <span>PLANNED {media.data.planned}</span>
            <span>DONE {media.data.completed}</span>
          </div>
        </>
      )}
    </div>
  );
}

function TasksPanel({ tasks }: { tasks: LoadState<{ open: Task[] }> }) {
  return (
    <div className="panel panel-lime p-6">
      <div className="syslabel text-lime-b mb-3">TODAY'S TASKS</div>
      {tasks.state === 'loading' && <p className="text-meta">Loading…</p>}
      {tasks.state === 'error' && <p className="text-coral">⚠ {tasks.message}</p>}
      {tasks.state === 'ok' && tasks.data.open.length === 0 && (
        <p className="text-meta-dark">Nothing due — capture a task below.</p>
      )}
      {tasks.state === 'ok' &&
        tasks.data.open.slice(0, 6).map((t) => (
          <div key={t.id} className="py-1.5 flex justify-between border-b border-line-l last:border-0">
            <span>{t.title}</span>
            <span className="font-mono text-xs text-meta">{PRIORITY_LABELS[t.priority] ?? '—'}</span>
          </div>
        ))}
    </div>
  );
}
