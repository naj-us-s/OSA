/**
 * Unit tests for the summary aggregation math.
 *
 * PURPOSE (§10): OS summaries must reflect actual Vocab/Media data. The math
 * lives in small pure/mostly-pure functions so we can test the grouping logic
 * without a live database (integration tests come in a later milestone with a
 * disposable test database).
 */
import { describe, expect, it } from 'vitest';

// The aggregation loop extracted for testability — matches mediaSummary logic.
export function foldMediaRows(
  rows: { status: string; category: string; n: number }[],
  favorites = 0,
) {
  const byCategory: Record<string, number | undefined> = { movie: 0, tv: 0, anime: 0, manga: 0, book: 0 };
  let total = 0, inProgress = 0, planned = 0, completed = 0;
  for (const r of rows) {
    const n = Number(r.n);
    const key = r.category as keyof typeof byCategory;
    byCategory[key] = (byCategory[key] ?? 0) + n;
    total += n;
    if (r.status === 'in_progress') inProgress += n;
    else if (r.status === 'planned') planned += n;
    else if (r.status === 'completed') completed += n;
  }
  return { totalItems: total, inProgress, planned, completed, favorites, byCategory };
}

describe('mediaSummary aggregation', () => {
  it('folds category+status groups into totals', () => {
    const sum = foldMediaRows([
      { status: 'in_progress', category: 'anime', n: 3 },
      { status: 'planned', category: 'book', n: 5 },
      { status: 'completed', category: 'anime', n: 2 },
      { status: 'dropped', category: 'tv', n: 1 },
    ]);
    expect(sum.totalItems).toBe(11);
    expect(sum.inProgress).toBe(3);
    expect(sum.planned).toBe(5);
    expect(sum.completed).toBe(2);
    expect(sum.byCategory.anime).toBe(5);
    expect(sum.byCategory.book).toBe(5);
    expect(sum.byCategory.tv).toBe(1);
  });

  it('returns zeros for an empty library (empty state, §4.3)', () => {
    const sum = foldMediaRows([]);
    expect(sum).toMatchObject({ totalItems: 0, inProgress: 0, planned: 0, completed: 0 });
    expect(sum.byCategory.movie).toBe(0);
  });
});
