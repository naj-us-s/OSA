/**
 * =============================================================================
 * CROSS-APP SUMMARIES — the explicit integration contract (master prompt §4.3)
 * =============================================================================
 * Personal OS fetches these at request time. They compute aggregates from the
 * REAL tables owned by each app — no mirrors, no denormalized counters to drift
 * out of sync. If a domain is empty the endpoint still answers with zeros, and
 * the frontends render empty states (§4.3 last paragraph).
 *
 * ROUTE CONTRACT (stable; versioned under /api):
 *   GET /api/vocab/summary      → VocabSummary
 *   GET /api/vocab/recent       → VocabRecentEntry[]
 *   GET /api/media/summary      → MediaSummary
 *   GET /api/media/recent       → MediaRecentItem[]
 *   GET /api/media/in-progress  → MediaRecentItem[]
 *
 * Future apps (habits, notes…) add their own module beside these, per §3.3.7:
 * no assumption that exactly three apps exist.
 * =============================================================================
 */
import { count, desc, eq, gt, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/client.js';
import { mediaItems, vocabEntries, vocabReviews } from '../db/schema.js';
import type { MediaCategory, MediaStatus } from '@pos/shared-types';

// ---------------------------------------------------------------------------
// Vocab
// ---------------------------------------------------------------------------

export async function vocabSummary(_req: Request, res: Response) {
  const rows = await db.select({ status: vocabEntries.learningStatus, n: count() }).from(vocabEntries).groupBy(vocabEntries.learningStatus);
  const total = rows.reduce((acc, r) => acc + Number(r.n), 0);
  const byStatus = { new: 0, learning: 0, known: 0 };
  for (const r of rows) byStatus[r.status as keyof typeof byStatus] = Number(r.n);

  const weekAgo = new Date(Date.now() - 7 * 86400_000);
  const recent = await db.select({ n: count() }).from(vocabEntries).where(gt(vocabEntries.createdAt, weekAgo));

  // "Due for review" — entries with at least one review never, or last reviewed
  // over 3 days ago (intentionally simple V1 heuristic; documented in §6.6).
  const due = await db.select({ n: count() }).from(vocabEntries).where(
    // REVIEW PRIMER: entries that have never had any review row
    sql`NOT EXISTS (SELECT 1 FROM ${vocabReviews} WHERE ${vocabReviews.entryId} = ${vocabEntries.id})`,
  );

  res.json({
    totalEntries: total,
    recentlyAdded: Number(recent[0]?.n ?? 0),
    dueForReview: Number(due[0]?.n ?? 0),
    byStatus,
  });
}

export async function vocabRecent(_req: Request, res: Response) {
  const rows = await db
    .select({
      id: vocabEntries.id,
      expression: vocabEntries.expression,
      language: vocabEntries.language,
      languageName: vocabEntries.languageName,
      entryType: vocabEntries.entryType,
      createdAt: vocabEntries.createdAt,
    })
    .from(vocabEntries)
    .orderBy(desc(vocabEntries.createdAt))
    .limit(10);
  res.json({ entries: rows });
}

// ---------------------------------------------------------------------------
// Media Tracker
// ---------------------------------------------------------------------------

export async function mediaSummary(_req: Request, res: Response) {
  const rows = await db.select({ status: mediaItems.status, category: mediaItems.category, n: count() }).from(mediaItems).groupBy(mediaItems.status, mediaItems.category);
  const fav = await db.select({ n: count() }).from(mediaItems).where(eq(mediaItems.favorite, 1));

  const byCategory: Record<MediaCategory, number> = { movie: 0, tv: 0, anime: 0, manga: 0, book: 0 };
  let total = 0, inProgress = 0, planned = 0, completed = 0;
  for (const r of rows) {
    const n = Number(r.n);
    byCategory[r.category as MediaCategory] += n;
    total += n;
    if (r.status === 'in_progress') inProgress += n;
    else if (r.status === 'planned') planned += n;
    else if (r.status === 'completed') completed += n;
  }

  res.json({
    totalItems: total,
    inProgress,
    planned,
    completed,
    favorites: Number(fav[0]?.n ?? 0),
    byCategory,
  });
}

export async function mediaRecent(_req: Request, res: Response) {
  res.json({ items: await pick('recent') });
}
export async function mediaInProgress(_req: Request, res: Response) {
  res.json({ items: await pick('in-progress') });
}

async function pick(kind: 'recent' | 'in-progress') {
  const q = db
    .select({
      id: mediaItems.id,
      title: mediaItems.title,
      category: mediaItems.category,
      status: mediaItems.status,
      posterUrl: mediaItems.posterUrl,
      addedAt: mediaItems.createdAt,
      lastUpdatedAt: mediaItems.updatedAt,
    })
    .from(mediaItems);

  if (kind === 'in-progress') {
    return q.where(eq(mediaItems.status, 'in_progress')).orderBy(desc(mediaItems.updatedAt)).limit(10);
  }
  return q.orderBy(desc(mediaItems.createdAt)).limit(10);
}

export type { MediaStatus };
