/**
 * Shared label maps. Keeping wording in one place prevents the "Watching vs
 * Reading" inconsistency problem (master prompt §7.5).
 */
import type { MediaCategory, MediaStatus, ProgressUnit } from '@pos/shared-types';

export const statusLabels: Record<MediaStatus, Record<MediaCategory, string>> = {
  planned: {
    movie: 'Plan to watch',
    tv: 'Plan to watch',
    anime: 'Plan to watch',
    manga: 'Plan to read',
    book: 'Plan to read',
  },
  in_progress: {
    movie: 'Watching',
    tv: 'Watching',
    anime: 'Watching',
    manga: 'Reading',
    book: 'Reading',
  },
  on_hold: {
    movie: 'On hold',
    tv: 'On hold',
    anime: 'On hold',
    manga: 'On hold',
    book: 'On hold',
  },
  completed: {
    movie: 'Watched',
    tv: 'Watched',
    anime: 'Watched',
    manga: 'Read',
    book: 'Read',
  },
  dropped: {
    movie: 'Dropped',
    tv: 'Dropped',
    anime: 'Dropped',
    manga: 'Dropped',
    book: 'Dropped',
  },
};

export const progressUnitLabels: Record<Exclude<ProgressUnit, null>, string> = {
  episodes: 'ep',
  chapters: 'ch',
  volumes: 'vol',
  pages: 'pp',
  percent: '%',
};

export const categoryLabels: Record<MediaCategory, string> = {
  movie: 'Movies',
  tv: 'TV Series',
  anime: 'Anime',
  manga: 'Manga',
  book: 'Books',
};
