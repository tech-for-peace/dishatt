export const UI_CONFIG = {
  mediaPerLoad: 12,
  cacheKey: "videoSearchFilters",
};

export const API_CONFIG = {
  cachePath: "/data/cache.json",
  // Worker URL for click counts. Empty skips the beacon.
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? "",
} as const;
