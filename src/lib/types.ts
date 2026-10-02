export type Language = "english" | "hindi" | "";

export type SortOrder = "newest" | "oldest";

export interface DurationBand {
  label: string;
  min?: number;
  max?: number;
}

export interface SearchFilters {
  language: Language;
  categories: string[];
  channels: string[];
  durationBands: string[];
  years: string[];
  titleSearch: string;
  freeOnly: boolean;
}

export interface MediaResult {
  id: string;
  title: string;
  thumbnail: string;
  duration: number; // in minutes
  publishedYear: number;
  publishedMonth?: number; // 0-11 (0 = January)
  publishedDay?: number; // 1-31
  language: "en" | "hi";
  url: string;
  audioOnly?: boolean; // for audio-only media
  timestamp?: number; // for internal sorting
  isNew?: boolean; // for showing "new" tag
  loginRequired?: boolean; // true if login is required to watch
  category?: string; // media category
  channel?: string; // media channel
  tags?: string[]; // searchable tags (en / hi / hinglish)
}

export const DURATION_BANDS: DurationBand[] = [
  { label: "< 10 min", max: 10 },
  { label: "10-20 min", min: 10, max: 20 },
  { label: "20-40 min", min: 20, max: 40 },
  { label: "40-60 min", min: 40, max: 60 },
  { label: "> 1 hour", min: 60 },
];

export interface FilterFacets {
  languages: Array<"english" | "hindi">;
  categories: string[];
  /** YouTube ContentSource strings; empty for non-YouTube sources. */
  channels: string[];
  /** Distinct published years, newest first. */
  years: string[];
  /** Duration band labels that contain at least one item. */
  durationBands: string[];
  /** When true, the Free-only checkbox is meaningful for this source. */
  hasLoginRequired: boolean;
}
