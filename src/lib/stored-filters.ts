import { UI_CONFIG } from "@/lib/constants";
import { DURATION_BANDS, SearchFilters } from "@/lib/types";

export const INITIAL_FILTERS: SearchFilters = {
  language: "",
  categories: [],
  channels: [],
  years: [],
  durationBands: [],
  titleSearch: "",
  freeOnly: false,
};

const VALID_LANGUAGES: string[] = ["", "english", "hindi"];
const VALID_CATEGORIES: string[] = ["Video", "Music", "Podcast"];
const VALID_DURATION_LABELS: string[] = DURATION_BANDS.map((band) => band.label);
const YEAR_REGEX = /^\d{4}$/;

export const isValidCategory = (value: string | null | undefined): value is string =>
  typeof value === "string" && VALID_CATEGORIES.includes(value);

const isStringArray = (
  value: unknown,
  maxLen: number,
  validator: (s: string) => boolean,
): boolean =>
  Array.isArray(value) &&
  value.length <= maxLen &&
  value.every((item) => typeof item === "string" && validator(item));

const isValidSearchFilters = (data: unknown): data is SearchFilters => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.language === "string" &&
    VALID_LANGUAGES.includes(obj.language) &&
    isStringArray(obj.categories, 10, isValidCategory) &&
    isStringArray(obj.channels, 20, (s) => s.length <= 100) &&
    isStringArray(obj.years, 20, (s) => YEAR_REGEX.test(s)) &&
    isStringArray(obj.durationBands, 10, (s) => VALID_DURATION_LABELS.includes(s)) &&
    typeof obj.titleSearch === "string" &&
    obj.titleSearch.length <= 500 &&
    typeof obj.freeOnly === "boolean"
  );
};

export function loadStoredFilters(): SearchFilters {
  const stored = localStorage.getItem(UI_CONFIG.cacheKey);
  if (!stored) return INITIAL_FILTERS;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!isValidSearchFilters(parsed)) return INITIAL_FILTERS;
    return { ...parsed, channels: parsed.channels.slice(0, 1) };
  } catch {
    return INITIAL_FILTERS;
  }
}

export function storeFilters(filters: SearchFilters): void {
  localStorage.setItem(UI_CONFIG.cacheKey, JSON.stringify(filters));
}
