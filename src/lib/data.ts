import { SearchFilters, VideoResult, DURATION_BANDS } from "@/lib/types";

const CACHE_PATH = "/data/cache.json";
const LAST_VISIT_KEY = "dishatt_last_visit";

let cachedVideos: VideoResult[] | null = null;
let cachePromise: Promise<VideoResult[]> | null = null;

/**
 * Get the last visit date from localStorage
 * Returns null if no previous visit
 */
function getLastVisitDate(): Date | null {
  if (typeof window === "undefined") return null;

  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  if (!lastVisit) return null;

  return new Date(lastVisit);
}

/**
 * Update the last visit date to current time
 */
function updateLastVisitDate(): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

/**
 * Determine which videos should be marked as new based on visit history
 * Ensures at least 5 videos are marked as new following the specified rules
 */
function determineNewVideos(
  videos: VideoResult[],
  lastVisit: Date | null,
): VideoResult[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let newVideos: VideoResult[] = [];

  if (!lastVisit) {
    newVideos = videos.filter((video) => {
      const videoDate = new Date(video.timestamp!);
      return (
        videoDate.getMonth() === currentMonth &&
        videoDate.getFullYear() === currentYear
      );
    });

    if (newVideos.length < 5) {
      const lastMonthVideos = videos.filter((video) => {
        const videoDate = new Date(video.timestamp!);
        return (
          videoDate.getMonth() === lastMonth &&
          videoDate.getFullYear() === lastMonthYear
        );
      });

      const needed = 5 - newVideos.length;
      newVideos = [...newVideos, ...lastMonthVideos.slice(0, needed)];
    }
  } else {
    newVideos = videos.filter((video) => {
      if (video.timestamp! <= lastVisit.getTime()) return false;

      const videoDate = new Date(video.timestamp!);
      const isCurrentMonth =
        videoDate.getMonth() === currentMonth &&
        videoDate.getFullYear() === currentYear;
      return isCurrentMonth;
    });

    if (newVideos.length < 5) {
      const lastMonthVideosSinceVisit = videos.filter((video) => {
        if (video.timestamp! <= lastVisit.getTime()) return false;

        const videoDate = new Date(video.timestamp!);
        return (
          videoDate.getMonth() === lastMonth &&
          videoDate.getFullYear() === lastMonthYear
        );
      });

      lastMonthVideosSinceVisit.sort((a, b) => b.timestamp! - a.timestamp!);
      const existingIds = new Set(newVideos.map((v) => v.id));
      const additionalVideos = lastMonthVideosSinceVisit.filter(
        (v) => !existingIds.has(v.id),
      );

      const needed = 5 - newVideos.length;
      newVideos = [...newVideos, ...additionalVideos.slice(0, needed)];
    }
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
  Name: string;
  Description?: string;
  ThumbnailURL: string;
  VideoDuration?: number;
  ClickURL?: string;
  PublishYear: number;
  PublishMonth?: number;
  PublishDay?: number;
  Language?: string;
  AudioOnly?: boolean;
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
      const lastVisit = getLastVisitDate();

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
                duration: Math.round((video.VideoDuration || 0) / 1e9 / 60),
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
                language: normalizeLanguageCode(video.Language),
                url: video.ClickURL,
                audioOnly: video.AudioOnly || false,
                timestamp,
              };
            })
            .sort((a, b) => b.timestamp - a.timestamp)
        : [];

      if (cachedVideos.length > 0) {
        cachedVideos = determineNewVideos(cachedVideos, lastVisit);
      }

      updateLastVisitDate();

      return cachedVideos;
    } catch (error) {
      console.error("Error reading cache file:", error);
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
