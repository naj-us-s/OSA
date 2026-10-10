/**
 * Shared types for the Personal OS ecosystem.
 *
 * RULE (docs/architecture.md §data-ownership): these types describe *contracts*
 * between applications — API payloads and cross-app references. They must never
 * import another app's database row types directly; each app owns its data and
 * exposes summaries through the documented API (§4.3 of the master prompt).
 */

// ---------------------------------------------------------------------------
// Personal OS — tasks
// ---------------------------------------------------------------------------

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null; // ISO 8601 date (YYYY-MM-DD) or datetime
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Personal OS — events / scheduling
// ---------------------------------------------------------------------------

export interface Event {
  id: string;
  title: string;
  description: string | null;
  /** ISO 8601 datetime, interpreted in the user's local timezone. */
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Vocab — integration summary (what Personal OS may consume)
// ---------------------------------------------------------------------------

export interface VocabSummary {
  totalEntries: number;
  /** Entries added within the last 7 days, for "recent additions" widgets. */
  recentlyAdded: number;
  /** Entries scheduled for review today; present only when review data exists. */
  dueForReview?: number;
  byStatus: {
    new: number;
    learning: number;
    known: number;
  };
}

export interface VocabRecentEntry {
  id: string;
  expression: string;
  language: string;
  languageName: string;
  entryType: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Media Tracker — integration summary (what Personal OS may consume)
// ---------------------------------------------------------------------------

export interface MediaSummary {
  totalItems: number;
  inProgress: number;
  planned: number;
  completed: number;
  byCategory: Record<MediaCategory, number>;
  favorites: number;
}

export interface MediaRecentItem {
  id: string;
  title: string;
  category: MediaCategory;
  status: MediaStatus;
  posterUrl: string | null;
  addedAt: string;
  lastUpdatedAt: string;
}

// ---------------------------------------------------------------------------
// Media Tracker — domain enums shared across frontends
// ---------------------------------------------------------------------------

export type MediaCategory = 'movie' | 'tv' | 'anime' | 'manga' | 'book';

/** Progress unit relevant to a category; movies/books often have none. */
export type ProgressUnit = 'episodes' | 'chapters' | 'volumes' | 'pages' | 'percent' | null;

/**
 * Consumption status. Display wording varies per category
 * ("Watching" for anime vs "Reading" for books) — see packages/ui-theme statusLabels.
 */
export type MediaStatus = 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'dropped';

// ---------------------------------------------------------------------------
// Cross-app references
// ---------------------------------------------------------------------------

/**
 * A reference from Personal OS into another app's entity. Personal OS stores
 * only this lightweight pointer (never a mutable copy of the other app's data)
 * so Vocab / Media Tracker remain the source of truth.
 */
export interface CrossAppRef {
  app: 'vocab' | 'media-tracker';
  /** Stable external id within the owning app. */
  externalId: string;
  title: string;
  url: string;
}
