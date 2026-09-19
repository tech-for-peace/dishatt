// Application constants
export const APP_CONFIG = {
  name: "Disha",
  description: "Discover videos from Timeless Today and Prem Rawat official YouTube channels",
} as const;

export const UI_CONFIG = {
  mediaPerLoad: 12,
  animationDelay: 100,
  cacheKey: "videoSearchFilters",
};

export const API_CONFIG = {
  cachePath: "/data/cache.json",
  searchDelay: 300,
  // Worker URL for click counts. Empty skips the beacon.
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? "",
} as const;
