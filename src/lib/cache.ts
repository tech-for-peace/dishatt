import { SearchFilters, VideoResult } from '@/types/search';

const CACHE_KEY = 'disha_search_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  results: VideoResult[];
  timestamp: number;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

function generateCacheKey(filters: SearchFilters): string {
  return JSON.stringify({
    language: filters.language,
    source: filters.source,
    durationBand: filters.durationBand,
    year: filters.year,
  });
}

export function getCachedResults(filters: SearchFilters): VideoResult[] | null {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;

    const cache: CacheStore = JSON.parse(cacheStr);
    const key = generateCacheKey(filters);
    const entry = cache[key];

    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      // Remove expired entry
      delete cache[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return entry.results;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export function setCachedResults(filters: SearchFilters, results: VideoResult[]): void {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    const cache: CacheStore = cacheStr ? JSON.parse(cacheStr) : {};

    const key = generateCacheKey(filters);
    cache[key] = {
      results,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}
