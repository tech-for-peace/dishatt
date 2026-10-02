import { SearchFilters, MediaResult, DURATION_BANDS, FilterFacets, SortOrder } from "@/lib/types";
import { API_CONFIG } from "@/lib/constants";
import { ActiveSource, getSourceKey, mediaForSource, sortYoutubeChannels } from "@/lib/sources";

const LAST_VISIT_KEY = "dishatt_last_visit";
const VISITOR_KEY = "dishatt_visitor_id";
const MIN_NEW_MEDIA = 2;
const VISITOR_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let cachedMedia: MediaResult[] | null = null;
let cachePromise: Promise<MediaResult[]> | null = null;

const isValidMediaId = (id: string): boolean => /^[\w-]{1,128}$/.test(id);

const isValidClickedIds = (data: unknown): data is string[] => {
  return (
    Array.isArray(data) &&
    data.length <= 5000 &&
    data.every((item) => typeof item === "string" && isValidMediaId(item))
  );
};

/** Clicked media IDs from localStorage; empty if missing or malformed. */
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
function saveClickedMediaIds(clickedIds: Set<string>, validMediaIds: Set<string>): void {
  if (typeof window === "undefined") return;

  // Only keep IDs that exist in current media dataset to prevent growth
  const cleanedIds = Array.from(clickedIds).filter((id) => validMediaIds.has(id));
  localStorage.setItem(LAST_VISIT_KEY, JSON.stringify(cleanedIds));
}

function getVisitorId(): string | null {
  try {
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem(VISITOR_KEY);
    if (stored && VISITOR_ID_RE.test(stored)) {
      return stored;
    }

    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget click count. Must never throw into the card click handler.
 */
export function recordMediaClick(mediaId: string): void {
  try {
    if (typeof window === "undefined") return;
    if (!isValidMediaId(mediaId) || !API_CONFIG.apiUrl) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    const payload = JSON.stringify({
      mediaId,
      visitorId,
    });
    const url = `${API_CONFIG.apiUrl.replace(/\/$/, "")}/api/clicks`;

    try {
      const blob = new Blob([payload], { type: "text/plain" });
      if (navigator.sendBeacon?.(url, blob)) {
        return;
      }
    } catch {
      // fall through to fetch
    }

    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: payload,
      keepalive: true,
      mode: "cors",
    }).catch(() => {
      // ignore network errors
    });
  } catch {
    // analytics must not block opening the video
  }
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
function determineNewMedia(media: MediaResult[], clickedIds: Set<string>): MediaResult[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Get current month media that haven't been clicked
  const currentMonthNewMedia = media.filter((media) => {
    if (clickedIds.has(media.id)) return false;
    const mediaDate = new Date(media.timestamp!);
    return mediaDate.getMonth() === currentMonth && mediaDate.getFullYear() === currentYear;
  });

  let newMedia = [...currentMonthNewMedia];

  // If not enough, add last month's unclicked media
  if (newMedia.length < MIN_NEW_MEDIA) {
    const lastMonthNewMedia = media.filter((media) => {
      if (clickedIds.has(media.id)) return false;
      const mediaDate = new Date(media.timestamp!);
      return mediaDate.getMonth() === lastMonth && mediaDate.getFullYear() === lastMonthYear;
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
  ContentSource?: string;
  Name: string;
  ThumbnailURL: string;
  Duration?: number;
  ClickURL?: string;
  PublishYear: number;
  PublishMonth?: number;
  PublishDay?: number;
  Language?: string;
  AudioOnly?: boolean;
  LoginRequired?: boolean;
  Tags?: string[] | null;
}

export async function loadAllMedia(): Promise<MediaResult[]> {
  if (cachedMedia) {
    return cachedMedia;
  }

  if (cachePromise) {
    return cachePromise;
  }

  cachePromise = (async () => {
    try {
      const response = await fetch(API_CONFIG.cachePath);
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
                media.PublishMonth - 1,
                media.PublishDay || 1,
              ).getTime();

              return {
                id: media.MediaID,
                title: media.Name,
                thumbnail: media.ThumbnailURL,
                duration: Math.round((media.Duration || 0) / 1e9 / 60),
                publishedYear: media.PublishYear,
                publishedMonth: media.PublishMonth - 1,
                publishedDay: media.PublishDay,
                language: normalizeLanguageCode(media.Language),
                url: media.ClickURL,
                audioOnly: media.AudioOnly || false,
                loginRequired: media.LoginRequired || false,
                timestamp,
                category: media.Category || "Video",
                channel: media.ContentSource || "",
                tags: media.Tags ?? undefined,
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
    } catch (error) {
      cachedMedia = null;
      throw error;
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}

export interface TopStatsItem {
  mediaId: string;
  clicks: number;
  title?: string;
  thumbnail?: string;
  url?: string;
  /** False when mediaId is absent from the current cache.json catalog. */
  inCatalog: boolean;
}

interface TopStatsResult {
  n: number;
  start: number;
  end: number;
  items: TopStatsItem[];
}

/**
 * Fetch top-N media by click count in the [start, end) hours-ago window,
 * then join catalog metadata from cache.json when available.
 */
export async function fetchTopStats(
  n: number,
  start: number,
  end: number,
): Promise<TopStatsResult> {
  if (!API_CONFIG.apiUrl) {
    throw new Error("API URL is not configured");
  }

  const url = new URL(`${API_CONFIG.apiUrl.replace(/\/$/, "")}/api/stats/top`);
  url.searchParams.set("n", String(n));
  url.searchParams.set("start", String(start));
  url.searchParams.set("end", String(end));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Stats request failed (${response.status})`);
  }

  const data = (await response.json()) as {
    n: number;
    start: number;
    end: number;
    items: { mediaId: string; clicks: number }[];
  };

  let catalog: MediaResult[] = [];
  try {
    catalog = await loadAllMedia();
  } catch {
    // Click stats are still useful when the catalog file fails to load.
  }
  const byId = new Map(catalog.map((m) => [m.id, m]));

  return {
    n: data.n,
    start: data.start,
    end: data.end,
    items: (data.items ?? []).map((item) => {
      const media = byId.get(item.mediaId);
      return {
        mediaId: item.mediaId,
        clicks: item.clicks,
        title: media?.title,
        thumbnail: media?.thumbnail,
        url: media?.url,
        inCatalog: media !== undefined,
      };
    }),
  };
}

function durationMatchesBand(duration: number, band: { min?: number; max?: number }): boolean {
  if (band.min !== undefined && duration < band.min) return false;
  if (band.max !== undefined && duration >= band.max) return false;
  return true;
}

/**
 * Derive filter options that actually exist among items for the chosen source.
 * Language/category menus with a single value are still returned so callers can
 * choose to hide them; channels are only populated for YouTube.
 * When `categories` is set (e.g. Video / Music from the picker), facets — including
 * channel chips — only reflect items in those categories.
 */
export function getFacets(
  media: MediaResult[],
  source: ActiveSource,
  categoriesFilter?: string[],
): FilterFacets {
  let scoped = mediaForSource(media, source);
  if (categoriesFilter && categoriesFilter.length > 0) {
    const allowed = new Set(categoriesFilter);
    scoped = scoped.filter((item) => allowed.has(item.category || "Video"));
  }

  const languageCodes = new Set<"en" | "hi">();
  const categories = new Set<string>();
  const channels = new Set<string>();
  const years = new Set<number>();
  let hasLoginRequired = false;

  for (const item of scoped) {
    languageCodes.add(item.language);
    categories.add(item.category || "Video");
    if (item.channel && getSourceKey(item.channel) === "youtube") {
      channels.add(item.channel);
    }
    years.add(item.publishedYear);
    if (item.loginRequired) hasLoginRequired = true;
  }

  const languages: Array<"english" | "hindi"> = [];
  if (languageCodes.has("en")) languages.push("english");
  if (languageCodes.has("hi")) languages.push("hindi");

  const durationBands = DURATION_BANDS.filter((band) =>
    scoped.some((item) => durationMatchesBand(item.duration || 0, band)),
  ).map((band) => band.label);

  return {
    languages,
    categories: Array.from(categories).sort(),
    channels: source === "youtube" ? sortYoutubeChannels(Array.from(channels)) : [],
    years: Array.from(years)
      .sort((a, b) => b - a)
      .map(String),
    durationBands,
    hasLoginRequired,
  };
}

/** Drop filter values that are no longer valid for the given facets. */
export function sanitizeFiltersAgainstFacets(
  filters: SearchFilters,
  facets: FilterFacets,
): SearchFilters {
  const languages = new Set(facets.languages);
  const categories = new Set(facets.categories);
  const channels = new Set(facets.channels);
  const years = new Set(facets.years);
  const durationBands = new Set(facets.durationBands);

  const language =
    filters.language && languages.has(filters.language as "english" | "hindi")
      ? filters.language
      : facets.languages.length === 1
        ? facets.languages[0]
        : "";

  return {
    language,
    categories: filters.categories.filter((c) => categories.has(c)),
    channels: filters.channels.filter((c) => channels.has(c)).slice(0, 1),
    years: filters.years.filter((y) => years.has(y)),
    durationBands: filters.durationBands.filter((b) => durationBands.has(b)),
    titleSearch: filters.titleSearch,
    freeOnly: facets.hasLoginRequired ? filters.freeOnly : false,
  };
}

/** The catalog is stored newest-first; "oldest" is its exact reverse. */
export function sortMedia(media: MediaResult[], order: SortOrder): MediaResult[] {
  return order === "oldest" ? [...media].reverse() : media;
}

export function filterMedia(media: MediaResult[], filters: SearchFilters): MediaResult[] {
  return media.filter((media) => {
    if (filters.language) {
      const mediaLang = media.language;
      const filterLang = filters.language === "hindi" ? "hi" : "en";
      if (mediaLang !== filterLang) {
        return false;
      }
    }

    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(media.category || "Video")) {
        return false;
      }
    }

    if (filters.channels && filters.channels.length > 0) {
      if (!media.channel || !filters.channels.includes(media.channel)) {
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
        return durationMatchesBand(duration, band);
      });
      if (!matchesAnyBand) return false;
    }

    if (filters.freeOnly && media.loginRequired) {
      return false;
    }

    if (filters.titleSearch) {
      if (!mediaMatchesSearch(media.tags, filters.titleSearch)) {
        return false;
      }
    }

    return true;
  });
}

function mediaMatchesSearch(tags: string[] | undefined, query: string): boolean {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
  if (tokens.length === 0) {
    return true;
  }
  if (!tags?.length) {
    return false;
  }
  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  return tokens.every((token) => normalizedTags.some((tag) => tokenMatchesTag(token, tag)));
}

function tokenMatchesTag(token: string, tag: string): boolean {
  if (tag.includes(token)) {
    return true;
  }
  if (isPrefixStem(token, tag)) {
    return true;
  }
  for (const word of tag.split(/\s+/).filter(Boolean)) {
    if (word.includes(token) || isPrefixStem(token, word)) {
      return true;
    }
    const allowed = maxEditDistance(Math.min(token.length, word.length));
    if (allowed > 0 && levenshtein(token, word) <= allowed) {
      return true;
    }
  }
  return false;
}

function isPrefixStem(token: string, stem: string): boolean {
  return stem.length >= 4 && token.startsWith(stem);
}

function maxEditDistance(len: number): number {
  if (len >= 8) return 2;
  if (len >= 4) return 1;
  return 0;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prevDiag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const sub = prevDiag + (a[i - 1] === b[j - 1] ? 0 : 1);
      prevDiag = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, sub);
    }
  }
  return prev[b.length];
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
