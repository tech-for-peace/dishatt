export const UI_CONFIG = {
  mediaPerLoad: 12,
  /** Bumped when filter shape / wizard UX changed so stale localStorage is ignored. */
  cacheKey: "videoSearchFilters_v2",
};

export const API_CONFIG = {
  cachePath: "/data/cache.json",
  // Worker URL for click counts. Empty skips the beacon.
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? "",
} as const;
