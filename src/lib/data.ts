import { SearchFilters, MediaResult, DURATION_BANDS } from "@/lib/types";

const CACHE_PATH = "/data/cache.json";
const LAST_VISIT_KEY = "dishatt_last_visit";
const MIN_NEW_MEDIA = 2;

let cachedMedia: MediaResult[] | null = null;
let cachePromise: Promise<MediaResult[]> | null = null;

/**
 * Get the set of clicked media IDs from localStorage
 * Returns empty set if no data or if old date format is detected
 */
const isValidMediaId = (id: string): boolean => /^[\w-]{1,128}$/.test(id);

const isValidClickedIds = (data: unknown): data is string[] => {
  return (
    Array.isArray(data) &&
    data.length <= 5000 &&
    data.every((item) => typeof item === "string" && isValidMediaId(item))
  );
};

function getClickedMediaIds(): Set<string> {
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
 * Save clicked media IDs to localStorage
 * Cleans up IDs that are no longer in the media dataset
 */
function saveClickedMediaIds(
  clickedIds: Set<string>,
  validMediaIds: Set<string>,
): void {
  if (typeof window === "undefined") return;

  // Only keep IDs that exist in current media dataset to prevent growth
  const cleanedIds = Array.from(clickedIds).filter((id) =>
    validMediaIds.has(id),
  );
  localStorage.setItem(LAST_VISIT_KEY, JSON.stringify(cleanedIds));
}

/**
 * Mark a media as clicked - exported for use by MediaCard
 */
export function markMediaAsClicked(mediaId: string): void {
  if (typeof window === "undefined") return;

  const clickedIds = getClickedMediaIds();
  clickedIds.add(mediaId);

  // Save without cleanup (we don't have valid IDs here, cleanup happens on load)
  localStorage.setItem(LAST_VISIT_KEY, JSON.stringify(Array.from(clickedIds)));

  // Update cached media to reflect the change
  if (cachedMedia) {
    cachedMedia = cachedMedia.map((media) =>
      media.id === mediaId ? { ...media, isNew: false } : media,
    );
  }
}

/**
 * Compare two media items for sorting: by timestamp descending,
 * then title length descending, then title descending alphabetically (case-insensitive)
 */
function compareMedia(a: MediaResult, b: MediaResult): number {
  const timeDiff = b.timestamp - a.timestamp;
  if (timeDiff !== 0) return timeDiff;
  const lenDiff = b.title.length - a.title.length;
  if (lenDiff !== 0) return lenDiff;
  return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
}

/**
 * Determine which media should be marked as new
 * A media is new if: published in current month AND never clicked
 * If fewer than MIN_NEW_MEDIA, include last month's unclicked media
 */
function determineNewMedia(
  media: MediaResult[],
  clickedIds: Set<string>,
): MediaResult[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Get current month media that haven't been clicked
  const currentMonthNewMedia = media.filter((media) => {
    if (clickedIds.has(media.id)) return false;
    const mediaDate = new Date(media.timestamp!);
    return (
      mediaDate.getMonth() === currentMonth &&
      mediaDate.getFullYear() === currentYear
    );
  });

  let newMedia = [...currentMonthNewMedia];

  // If not enough, add last month's unclicked media
  if (newMedia.length < MIN_NEW_MEDIA) {
    const lastMonthNewMedia = media.filter((media) => {
      if (clickedIds.has(media.id)) return false;
      const mediaDate = new Date(media.timestamp!);
      return (
        mediaDate.getMonth() === lastMonth &&
        mediaDate.getFullYear() === lastMonthYear
      );
    });

    // Sort by timestamp descending (most recent first), then by title length descending, then by title descending
    lastMonthNewMedia.sort(compareMedia);

    const needed = MIN_NEW_MEDIA - newMedia.length;
    newMedia = [...newMedia, ...lastMonthNewMedia.slice(0, needed)];
  }

  // Mark the selected media as new
  const newMediaIds = new Set(newMedia.map((m) => m.id));
  return media.map((media) => ({
    ...media,
    isNew: newMediaIds.has(media.id),
  }));
}

interface MediaData {
  MediaID: string;
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

async function loadAllMedia(): Promise<MediaResult[]> {
  if (cachedMedia) {
    return cachedMedia;
  }

  if (cachePromise) {
    return cachePromise;
  }

  cachePromise = (async () => {
    try {
      const response = await fetch(CACHE_PATH);
      if (!response.ok) {
        throw new Error("Failed to load media data");
      }

      const data = await response.json();
      const clickedIds = getClickedMediaIds();

      cachedMedia = data.medias
        ? Object.values(data.medias)
            .map((media: MediaData) => {
              const timestamp = new Date(
                media.PublishYear,
                (media.PublishMonth || 1) - 1,
                media.PublishDay || 1,
              ).getTime();

              return {
                id: media.MediaID,
                title: media.Name,
                description: media.Description || "",
                thumbnail: media.ThumbnailURL,
                duration: Math.round((media.Duration || 0) / 1e9 / 60),
                source: (media.ClickURL?.includes("youtube.com")
                  ? "youtube"
                  : media.ClickURL?.includes("spotify.com")
                    ? "spotify"
                    : media.ClickURL?.includes("mixcloud.com")
                      ? "transradio"
                      : media.ClickURL?.includes("intelligentexistence.com")
                        ? "intelligentexistence"
                        : "timelesstoday") as
                  | "youtube"
                  | "timelesstoday"
                  | "spotify"
                  | "transradio"
                  | "intelligentexistence",
                publishedYear: media.PublishYear,
                publishedMonth: media.PublishMonth - 1,
                publishedDay: media.PublishDay,
                language: normalizeLanguageCode(media.Language),
                url: media.ClickURL,
                audioOnly: media.AudioOnly || false,
                loginRequired: media.LoginRequired || false,
                timestamp,
                category: media.Category || "Video",
              };
            })
            .sort(compareMedia)
        : [];

      if (cachedMedia.length > 0) {
        // Get valid media IDs to clean up storage
        const validMediaIds = new Set(cachedMedia.map((m) => m.id));
        saveClickedMediaIds(clickedIds, validMediaIds);

        cachedMedia = determineNewMedia(cachedMedia, clickedIds);
      }

      return cachedMedia;
    } catch {
      return [];
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}
export async function searchMedia(
  filters: SearchFilters,
): Promise<MediaResult[]> {
  const allMedia = await loadAllMedia();
  return filterMedia(allMedia, filters);
}

function filterMedia(
  media: MediaResult[],
  filters: SearchFilters,
): MediaResult[] {
  return media.filter((media) => {
    if (filters.language) {
      const mediaLang = media.language;
      const filterLang = filters.language === "hindi" ? "hi" : "en";
      if (mediaLang !== filterLang) {
        return false;
      }
    }

    if (filters.source && media.source !== filters.source) {
      return false;
    }

    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(media.category || "Video")) {
        return false;
      }
    }

    if (filters.years && filters.years.length > 0) {
      if (!filters.years.includes(String(media.publishedYear))) {
        return false;
      }
    }

    if (filters.durationBands && filters.durationBands.length > 0) {
      const duration = media.duration || 0;
      const matchesAnyBand = filters.durationBands.some((bandLabel) => {
        const band = DURATION_BANDS.find((b) => b.label === bandLabel);
        if (!band) return false;
        if (band.min !== undefined && duration < band.min) return false;
        if (band.max !== undefined && duration >= band.max) return false;
        return true;
      });
      if (!matchesAnyBand) return false;
    }

    if (filters.freeOnly && media.loginRequired) {
      return false;
    }

    if (filters.titleSearch) {
      const searchWords = filters.titleSearch
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      const title = media.title.toLowerCase();
      const description = media.description.toLowerCase();

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
