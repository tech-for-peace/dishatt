export type Language = "english" | "hindi" | "";
export type Source = "youtube" | "timelesstoday" | "spotify" | "transradio" | "";
export type Category = "Video" | "Music" | "Podcast" | "Video Music";

export interface DurationBand {
  label: string;
  min?: number;
  max?: number;
}

export interface SearchFilters {
  language: Language;
  source: Source;
  categories: string[];
  durationBands: string[];
  years: string[];
  titleSearch: string;
  freeOnly: boolean;
}

export interface VideoResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number; // in minutes
  source: "youtube" | "timelesstoday" | "spotify" | "transradio";
  publishedYear: number;
  publishedMonth?: number; // 0-11 (0 = January)
  publishedDay?: number; // 1-31
  language: "en" | "hi";
  url: string;
  audioOnly?: boolean; // for audio-only videos
  timestamp?: number; // for internal sorting
  isNew?: boolean; // for showing "new" tag
  loginRequired?: boolean; // true if login is required to watch
  category?: string; // video category
}

export interface SearchResponse {
  results: VideoResult[];
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

export const CATEGORIES = ["Video", "Music", "Podcast", "Video Music"] as const;
