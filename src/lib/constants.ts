// Application constants
export const APP_CONFIG = {
  name: "Disha",
  description:
    "Discover videos from Timeless Today and Prem Rawat official YouTube channels",
} as const;

export const UI_CONFIG = {
  mediaPerLoad: 12,
  animationDelay: 100,
  cacheKey: "mediaSearchFilters",
};

export const API_CONFIG = {
  cachePath: "/data/cache.json",
  searchDelay: 300,
} as const;
