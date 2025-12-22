export type Language = 'english' | 'hindi' | '';
export type Source = 'youtube' | 'timelesstoday' | '';

export interface DurationBand {
  label: string;
  min?: number;
  max?: number;
}

export interface SearchFilters {
  language: Language;
  source: Source;
  durationBand: string;
  year: string;
}

export interface VideoResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number; // in minutes
  source: 'youtube' | 'timelesstoday';
  publishedYear: number;
  publishedMonth?: number; // 0-11 (0 = January)
  language: 'en' | 'hi';
  url: string;
  timestamp?: number; // for internal sorting
}

export interface SearchResponse {
  results: VideoResult[];
  total: number;
  limit: number;
  offset: number;
}

export const DURATION_BANDS: DurationBand[] = [
  { label: 'Any Duration' },
  { label: '< 10 min', max: 10 },
  { label: '10-20 min', min: 10, max: 20 },
  { label: '20-40 min', min: 20, max: 40 },
  { label: '40-60 min', min: 40, max: 60 },
  { label: '> 1 hour', min: 60 },
];

export const YEARS = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString());
