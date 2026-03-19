export type Language = "english" | "hindi" | "";

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
  description: string;
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
}

export interface MediaResponse {
  results: MediaResult[];
  total: number;
  limit: number;
  offset: number;
}

export const DURATION_BANDS: DurationBand[] = [
  { label: "Any Duration" },
  { label: "< 10 min", max: 10 },
  { label: "10-20 min", min: 10, max: 20 },
  { label: "20-40 min", min: 20, max: 40 },
  { label: "40-60 min", min: 40, max: 60 },
  { label: "> 1 hour", min: 60 },
];

export const YEARS = Array.from({ length: 15 }, (_, i) =>
  (new Date().getFullYear() - i).toString(),
);
