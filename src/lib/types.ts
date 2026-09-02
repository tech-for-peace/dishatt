export type Language = "english" | "hindi";

export interface DurationBand {
  label: string;
  min?: number;
  max?: number;
}

export interface SearchFilters {
  languages: Language[];
  categories: string[];
  channels: string[];
  durationBands: string[];
  years: string[];
  titleSearch: string;
  searchTokens: string[];
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
  tags?: string[]; // searchable tags (en / hi / hinglish)
}

export const DURATION_BANDS: DurationBand[] = [
  { label: "< 5 min", max: 5 },
  { label: "5-15 min", min: 5, max: 15 },
  { label: "15-30 min", min: 15, max: 30 },
  { label: "30-60 min", min: 30, max: 60 },
  { label: "> 1 hour", min: 60 },
];

export const YEARS = Array.from({ length: 15 }, (_, i) =>
  (new Date().getFullYear() - i).toString(),
);
