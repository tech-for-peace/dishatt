// Application constants
export const APP_CONFIG = {
  name: "Disha",
  description:
    "Discover videos from Timeless Today and Prem Rawat official YouTube",
} as const;

export const UI_CONFIG = {
  videosPerLoad: 12,
  animationDelay: 100,
  cacheKey: "videoSearchFilters",
};

export const API_CONFIG = {
  cachePath: "/data/cache.json",
  searchDelay: 300,
} as const;
