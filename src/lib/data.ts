import type { SearchFilters, VideoResult } from '@/types/search';
import { DURATION_BANDS } from '@/types/search';

const CACHE_PATH = '/data/cache.json';

// In-memory cache for the video data
let cachedVideos: VideoResult[] | null = null;
let cachePromise: Promise<VideoResult[]> | null = null;

type SearchOptions = SearchFilters;

async function loadAllVideos(): Promise<VideoResult[]> {
  // Return cached data if already loaded
  if (cachedVideos) {
    return cachedVideos;
  }

  // Return existing promise if currently loading
  if (cachePromise) {
    return cachePromise;
  }

  // Create and cache the loading promise
  cachePromise = (async () => {
    try {
      const response = await fetch(CACHE_PATH);
      if (!response.ok) {
        throw new Error(`Failed to fetch cache: ${response.statusText}`);
      }

      const data = await response.json();
      cachedVideos = data.videos
        ? Object.values(data.videos)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((video: any) => ({
              id: video.VideoID,
              title: video.Name,
              description: video.Description || '',
              thumbnail: video.ThumbnailURL,
              // Convert nanoseconds to minutes (1e9 ns in a second, 60 seconds in a minute)
              duration: Math.round((video.VideoDuration || 0) / 1e9 / 60),
              source: (video.ClickURL?.includes('youtube.com') ? 'youtube' : 'timelesstoday') as 'youtube' | 'timelesstoday',
              publishedYear: video.PublishYear,
              publishedMonth: video.PublishMonth - 1, // Convert to 0-indexed month for Date
              language: normalizeLanguageCode(video.Language),
              url: video.ClickURL,
              // Store timestamp for sorting
              timestamp: new Date(video.PublishYear, (video.PublishMonth || 1) - 1, 1).getTime(),
            }))
            // Sort by publish date (newest first)
            .sort((a, b) => b.timestamp - a.timestamp)
        : [];

      return cachedVideos;
    } catch (error) {
      console.error('Error reading cache file:', error);
      return [];
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}

export async function searchVideos(
  filters: SearchOptions
): Promise<VideoResult[]> {
  const allVideos = await loadAllVideos();
  return filterVideos(allVideos, filters);
}

function filterVideos(
  videos: VideoResult[],
  filters: SearchFilters
): VideoResult[] {
  return videos.filter(video => {
    // Language filter - convert filter language to VideoResult format ('en' | 'hi')
    if (filters.language) {
      const videoLang = video.language; // Already in 'en' | 'hi' format
      const filterLang = filters.language === 'hindi' ? 'hi' : 'en';
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
      const matchesAnyBand = filters.durationBands.some(bandLabel => {
        const band = DURATION_BANDS.find(b => b.label === bandLabel);
        if (!band) return false;
        if (band.min !== undefined && duration < band.min) return false;
        if (band.max !== undefined && duration >= band.max) return false;
        return true;
      });
      if (!matchesAnyBand) return false;
    }

    // Title search - search for each word in the title
    if (filters.titleSearch) {
      const searchWords = filters.titleSearch.trim().toLowerCase().split(/\s+/).filter(word => word.length > 0);
      const title = video.title.toLowerCase();

      // All search words must be found in the title
      for (const word of searchWords) {
        if (!title.includes(word)) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Normalizes language codes to the format used in VideoResult ('en' | 'hi')
 * Handles both 'en'/'hi' and 'english'/'hindi' formats
 */
function normalizeLanguageCode(langCode?: string): 'en' | 'hi' {
  if (!langCode) return 'en';

  const lang = langCode.split('-')[0].toLowerCase();

  // Handle full language names
  if (lang === 'hindi') return 'hi';
  if (lang === 'english') return 'en';

  // Handle language codes
  if (lang === 'hi') return 'hi';

  // Default to English
  return 'en';
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatLanguage(langCode: string): string {
  return langCode === 'hi' ? 'Hindi' : 'English';
}
