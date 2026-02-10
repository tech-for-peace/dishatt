import { SearchFilters, VideoResult, DURATION_BANDS } from "@/lib/types";

const CACHE_PATH = "/data/cache.json";
const LAST_VISIT_KEY = "dishatt_last_visit";
const MIN_NEW_VIDEOS = 2;

let cachedVideos: VideoResult[] | null = null;
let cachePromise: Promise<VideoResult[]> | null = null;

/**
 * Get the set of clicked video IDs from localStorage
 * Returns empty set if no data or if old date format is detected
 */
const isValidClickedIds = (data: unknown): data is string[] => {
  return Array.isArray(data) && data.every((item) => typeof item === "string");
};

function getClickedVideoIds(): Set<string> {
  if (typeof window === "undefined") return new Set();

  const stored = localStorage.getItem(LAST_VISIT_KEY);
  if (!stored) return new Set();

  try {
    const parsed = JSON.parse(stored);
    // Validate it's an array of strings
    if (isValidClickedIds(parsed)) {
      return new Set(parsed);
    }
    // Invalid format - return empty
    return new Set();
  } catch {
    // If JSON parse fails - return empty
    return new Set();
  }
}

/**
 * Save clicked video IDs to localStorage
 * Cleans up IDs that are no longer in the video dataset
 */
function saveClickedVideoIds(
  clickedIds: Set<string>,
  validVideoIds: Set<string>,
): void {
  if (typeof window === "undefined") return;

  // Only keep IDs that exist in current video dataset to prevent growth
  const cleanedIds = Array.from(clickedIds).filter((id) =>
    validVideoIds.has(id),
  );
  localStorage.setItem(LAST_VISIT_KEY, JSON.stringify(cleanedIds));
}

/**
 * Mark a video as clicked - exported for use by VideoCard
 */
export function markVideoAsClicked(videoId: string): void {
  if (typeof window === "undefined") return;

  const clickedIds = getClickedVideoIds();
  clickedIds.add(videoId);

  // Save without cleanup (we don't have valid IDs here, cleanup happens on load)
  localStorage.setItem(LAST_VISIT_KEY, JSON.stringify(Array.from(clickedIds)));

  // Update cached videos to reflect the change
  if (cachedVideos) {
    cachedVideos = cachedVideos.map((video) =>
      video.id === videoId ? { ...video, isNew: false } : video,
    );
  }
}

/**
 * Determine which videos should be marked as new
 * A video is new if: published in current month AND never clicked
 * If fewer than MIN_NEW_VIDEOS, include last month's unclicked videos
 */
function determineNewVideos(
  videos: VideoResult[],
  clickedIds: Set<string>,
): VideoResult[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Get current month videos that haven't been clicked
  const currentMonthNewVideos = videos.filter((video) => {
    if (clickedIds.has(video.id)) return false;
    const videoDate = new Date(video.timestamp!);
    return (
      videoDate.getMonth() === currentMonth &&
      videoDate.getFullYear() === currentYear
    );
  });

  let newVideos = [...currentMonthNewVideos];

  // If not enough, add last month's unclicked videos
  if (newVideos.length < MIN_NEW_VIDEOS) {
    const lastMonthNewVideos = videos.filter((video) => {
      if (clickedIds.has(video.id)) return false;
      const videoDate = new Date(video.timestamp!);
      return (
        videoDate.getMonth() === lastMonth &&
        videoDate.getFullYear() === lastMonthYear
      );
    });

    // Sort by timestamp descending (most recent first)
    lastMonthNewVideos.sort((a, b) => b.timestamp! - a.timestamp!);

    const needed = MIN_NEW_VIDEOS - newVideos.length;
    newVideos = [...newVideos, ...lastMonthNewVideos.slice(0, needed)];
  }

  // Mark the selected videos as new
  const newVideoIds = new Set(newVideos.map((v) => v.id));
  return videos.map((video) => ({
    ...video,
    isNew: newVideoIds.has(video.id),
  }));
}

interface VideoData {
  VideoID: string;
  Category?: string;
  Name: string;
  Description?: string;
  ThumbnailURL: string;
  Duration?: number;
  ClickURL?: string;
  PublishYear: number;
  PublishMonth?: number;
  PublishDay?: number;
  Language?: string;
  AudioOnly?: boolean;
  LoginRequired?: boolean;
}

async function loadAllVideos(): Promise<VideoResult[]> {
  if (cachedVideos) {
    return cachedVideos;
  }

  if (cachePromise) {
    return cachePromise;
  }

  cachePromise = (async () => {
    try {
      const response = await fetch(CACHE_PATH);
      if (!response.ok) {
        throw new Error(`Failed to fetch cache: ${response.statusText}`);
      }

      const data = await response.json();
      const clickedIds = getClickedVideoIds();

      cachedVideos = data.videos
        ? Object.values(data.videos)
            .map((video: VideoData) => {
              const timestamp = new Date(
                video.PublishYear,
                (video.PublishMonth || 1) - 1,
                video.PublishDay || 1,
              ).getTime();

              return {
                id: video.VideoID,
                title: video.Name,
                description: video.Description || "",
                thumbnail: video.ThumbnailURL,
                duration: Math.round((video.Duration || 0) / 1e9 / 60),
                source: (video.ClickURL?.includes("youtube.com")
                  ? "youtube"
                  : video.ClickURL?.includes("spotify.com")
                    ? "spotify"
                    : "timelesstoday") as
                  | "youtube"
                  | "timelesstoday"
                  | "spotify",
                publishedYear: video.PublishYear,
                publishedMonth: video.PublishMonth - 1,
                publishedDay: video.PublishDay,
                language: normalizeLanguageCode(video.Language),
                url: video.ClickURL,
                audioOnly: video.AudioOnly || false,
                loginRequired: video.LoginRequired || false,
                timestamp,
                category: video.Category || "Video",
              };
            })
            .sort((a, b) => b.timestamp - a.timestamp)
        : [];

      if (cachedVideos.length > 0) {
        // Get valid video IDs to clean up storage
        const validVideoIds = new Set(cachedVideos.map((v) => v.id));
        saveClickedVideoIds(clickedIds, validVideoIds);

        cachedVideos = determineNewVideos(cachedVideos, clickedIds);
      }

      return cachedVideos;
    } catch {
      return [];
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}
export async function searchVideos(
  filters: SearchFilters,
): Promise<VideoResult[]> {
  const allVideos = await loadAllVideos();
  return filterVideos(allVideos, filters);
}

function filterVideos(
  videos: VideoResult[],
  filters: SearchFilters,
): VideoResult[] {
  return videos.filter((video) => {
    if (filters.language) {
      const videoLang = video.language;
      const filterLang = filters.language === "hindi" ? "hi" : "en";
      if (videoLang !== filterLang) {
        return false;
      }
    }

    if (filters.source && video.source !== filters.source) {
      return false;
    }

    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(video.category || "Video")) {
        return false;
      }
    }

    if (filters.years && filters.years.length > 0) {
      if (!filters.years.includes(String(video.publishedYear))) {
        return false;
      }
    }

    if (filters.durationBands && filters.durationBands.length > 0) {
      const duration = video.duration || 0;
      const matchesAnyBand = filters.durationBands.some((bandLabel) => {
        const band = DURATION_BANDS.find((b) => b.label === bandLabel);
        if (!band) return false;
        if (band.min !== undefined && duration < band.min) return false;
        if (band.max !== undefined && duration >= band.max) return false;
        return true;
      });
      if (!matchesAnyBand) return false;
    }

    if (filters.freeOnly && video.loginRequired) {
      return false;
    }

    if (filters.titleSearch) {
      const searchWords = filters.titleSearch
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      const title = video.title.toLowerCase();
      const description = video.description.toLowerCase();

      for (const word of searchWords) {
        if (!title.includes(word) && !description.includes(word)) {
          return false;
        }
      }
    }

    return true;
  });
}
function normalizeLanguageCode(langCode?: string): "en" | "hi" {
  if (!langCode) return "en";
  const lang = langCode.split("-")[0].toLowerCase();

  if (lang === "hindi") return "hi";
  if (lang === "english") return "en";
  if (lang === "hi") return "hi";

  return "en";
}

export function formatLanguage(langCode: string): string {
  return langCode === "hi" ? "Hindi" : "English";
}
