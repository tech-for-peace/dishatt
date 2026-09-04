// Application constants
export const APP_CONFIG = {
  name: "Disha",
  description:
    "Discover videos from Timeless Today and Prem Rawat official YouTube channels",
} as const;

// Categories that exist in the data but get no filter pill of their own.
// Their content is still listed; only the button is hidden.
export const HIDDEN_CATEGORIES: string[] = ["Podcast"];

export const UI_CONFIG = {
  rowInitialCount: 12,
  rowPageSize: 12,
  animationDelay: 100,
  cacheKey: "videoSearchFilters",
};

export const API_CONFIG = {
  cachePath: "/data/cache.json",
  searchDelay: 300,
} as const;
