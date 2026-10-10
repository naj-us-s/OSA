/**
 * =============================================================================
 * DATABASE SCHEMA — V1
 * =============================================================================
 * DATA OWNERSHIP (master prompt §4.2) — each domain lives in its own tables:
 *
 *   personal-os  →  tasks, events
 *   vocab        →  vocab_entries, vocab_meanings, vocab_reviews
 *   media        →  media_items, media_activity
 *
 * Cross-app data is NEVER copied into another domain's tables. Personal OS
 * displays other apps' data only through their summary API endpoints (§4.3),
 * which compute real aggregates at request time.
 *
 * CONVENTIONS
 *   - uuid primary keys (stable identifiers for future cross-app refs, §3.3 rule 2)
 *   - created_at/updated_at timestamps on every user-owned row
 *   - JSONB for open-ended personal input (tags, notes field bags), columns for
 *     anything we query/filter/sort on
 * =============================================================================
 */
import { index, integer, jsonb, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// PERSONAL OS — tasks
// ---------------------------------------------------------------------------

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    /** Plain date (YYYY-MM-DD) — due dates are local, not instants. */
    dueDate: text('due_date'),
    priority: smallint('priority').notNull().default(1), // 0 low · 1 medium · 2 high
    status: text('status', { enum: ['todo', 'in_progress', 'done'] })
      .notNull()
      .default('todo'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('tasks_status_idx').on(t.status), index('tasks_due_idx').on(t.dueDate)],
);

// ---------------------------------------------------------------------------
// PERSONAL OS — events
// ---------------------------------------------------------------------------

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    /** Real instants stored as timestamptz so timezone handling stays correct. */
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('events_starts_idx').on(t.startsAt)],
);

// ---------------------------------------------------------------------------
// VOCAB — entries, meanings, reviews
// ---------------------------------------------------------------------------

/**
 * An entry = one expression (word / phrase / idiom / technical term) in one
 * language. Universal-language support (§6.2) means: no fixed language list,
 * `expression` stores whatever the user typed (any script), and separate
 * optional columns carry normalized reading/romanization when the language has
 * them (Japanese furigana, Cyrillic transliteration…). Nothing language-specific
 * is required, so Runic as well as Latin both fit.
 */
export const vocabEntries = pgTable(
  'vocab_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** The expression EXACTLY as the user gave it (never normalized) — §6.8. */
    expression: text('expression').notNull(),
    /** BCP-47 tag (e.g. 'ja', 'en', 'pt-BR'); free-form label shown in UI. */
    language: text('language').notNull(),
    /** Optional human language name for display ('Japanese', 'English'). */
    languageName: text('language_name'),
    /** general | phrase | idiom | technical | other — open to extension. */
    entryType: text('entry_type').notNull().default('general'),
    /** Reading/pronunciation in source orthography (e.g. furigana, IPA). */
    pronunciation: text('pronunciation'),
    /** Romanization/transliteration (romaji, pinyin, ISO-9…). */
    romanization: text('romanization'),
    /** Where the user encountered it — optional personal context (§6.8). */
    context: text('context'),
    notes: text('notes'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    /** new | learning | known — plain learning state (§6.6). */
    learningStatus: text('learning_status', { enum: ['new', 'learning', 'known'] })
      .notNull()
      .default('new'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('vocab_lang_idx').on(t.language),
    index('vocab_status_idx').on(t.learningStatus),
    // Fast prefix search across any script; pg_trgm index added in migration 0002.
    index('vocab_expr_idx').on(t.expression),
  ],
);

/**
 * Multiple meanings per entry (§6.3). `nuance` distinguishes close senses
 * ("happy" vs "elated") without assuming interchangeability (§6.7). `source`
 * marks provenance: 'user' (typed by user) vs 'dictionary:<provider>' (fetched),
 * so dictionary-derived content stays distinguishable (§6.3).
 */
export const vocabMeanings = pgTable(
  'vocab_meanings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => vocabEntries.id, { onDelete: 'cascade' }),
    definition: text('definition').notNull(),
    /** Register/context line: "formal", "slang", "CS jargon"… */
    nuance: text('nuance'),
    example: text('example'),
    translation: text('translation'),
    partOfSpeech: text('part_of_speech'),
    /** 'user' | 'dictionary:free-dict' | 'dictionary:wiktionary' … */
    source: text('source').notNull().default('user'),
    orderIndex: smallint('order_index').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('vocab_meanings_entry_idx').on(t.entryId)],
);

/**
 * Review history (§6.6). V1 records bare outcomes; a spaced-repetition schedule
 * can be introduced later by reading this table — no schema rewrite needed.
 */
export const vocabReviews = pgTable(
  'vocab_reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => vocabEntries.id, { onDelete: 'cascade' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull().defaultNow(),
    /** 0 fail · 1 hard · 2 good · 3 easy */
    outcome: smallint('outcome').notNull(),
  },
  (t) => [index('vocab_reviews_entry_idx').on(t.entryId), index('vocab_reviews_at_idx').on(t.reviewedAt)],
);

// ---------------------------------------------------------------------------
// MEDIA TRACKER — library items and activity
// ---------------------------------------------------------------------------

/**
 * One row per media work in the user's library. `category` is the discriminator:
 * progress columns are validated per-category in the service layer (§7.6) —
 * e.g. movies use watchedAt, tv/anime use currentEpisode, manga uses
 * currentChapter/Volume, books use currentPage.
 *
 * `externalKey` + `externalSource` identify the metadata record the item came
 * from so re-searching the same title doesn't create duplicates (§7.4). Users
 * may also create fully manual items (externalSource = 'manual').
 */
export const mediaItems = pgTable(
  'media_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    category: text('category', {
      enum: ['movie', 'tv', 'anime', 'manga', 'book'],
    }).notNull(),
    title: text('title').notNull(),
    originalTitle: text('original_title'),
    posterUrl: text('poster_url'),
    synopsis: text('synopsis'),
    year: integer('year'),
    creator: text('creator'), // author/director/studio, whatever each provider gives
    genres: jsonb('genres').$type<string[]>().notNull().default([]),
    /** Known total units, if the provider reports one — never fabricated (§7.6). */
    totalEpisodes: integer('total_episodes'),
    totalChapters: integer('total_chapters'),
    totalVolumes: integer('total_volumes'),
    totalPages: integer('total_pages'),
    /** planned | in_progress | on_hold | completed | dropped (§7.5). */
    status: text('status', {
      enum: ['planned', 'in_progress', 'on_hold', 'completed', 'dropped'],
    })
      .notNull()
      .default('planned'),
    favorite: integer('favorite').notNull().default(0), // boolean-as-int for simple partial index
    /** User rating 1–10, null = unrated. */
    rating: smallint('rating'),
    notes: text('notes'),
    currentEpisode: integer('current_episode'),
    currentChapter: integer('current_chapter'),
    currentVolume: integer('current_volume'),
    currentPage: integer('current_page'),
    externalSource: text('external_source').notNull().default('manual'), // tmdb | jikan | openlibrary | manual
    externalKey: text('external_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [
    index('media_status_idx').on(t.status),
    index('media_category_idx').on(t.category),
    index('media_updated_idx').on(t.updatedAt),
    // Duplicate prevention (§7.4): same provider record can only be saved once.
    uniqueIndex('media_external_uniq').on(t.externalSource, t.externalKey),
  ],
);

/**
 * Append-only activity log (§7.9) — the audit trail powering "recent activity"
 * and future statistics. We never mutate rows; status changes and progress
 * updates emit events.
 */
export const mediaActivity = pgTable(
  'media_activity',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    itemId: uuid('item_id')
      .notNull()
      .references(() => mediaItems.id, { onDelete: 'cascade' }),
    activityType: text('activity_type', {
      enum: ['added', 'status_changed', 'progress', 'rating', 'notes', 'favorite', 'completed'],
    }).notNull(),
    detail: text('detail'), // human-readable summary line
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('media_activity_item_idx').on(t.itemId), index('media_activity_at_idx').on(t.createdAt)],
);
