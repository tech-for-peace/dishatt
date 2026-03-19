import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/components/Header";
import { FilterPanel } from "@/components/FilterPanel";
import { MediaGrid } from "@/components/MediaGrid";

import { searchMedia } from "@/lib/data";
import { SearchFilters, MediaResult, DURATION_BANDS } from "@/lib/types";
import { useToast } from "@/lib";
import { UI_CONFIG } from "@/lib/constants";

const initialFilters: SearchFilters = {
  language: "",
  source: "",
  categories: [],
  years: [],
  durationBands: [],
  titleSearch: "",
  freeOnly: false,
};

const VALID_LANGUAGES: string[] = ["", "english", "hindi"];
const VALID_SOURCES: string[] = [
  "",
  "youtube",
  "timelesstoday",
  "spotify",
  "intelligentexistence",
];
const VALID_CATEGORIES: string[] = ["Video", "Music", "Podcast", "Video Music"];
const VALID_DURATION_LABELS: string[] = DURATION_BANDS.map((b) => b.label);
const YEAR_REGEX = /^\d{4}$/;

const isStringArray = (
  arr: unknown[],
  maxLen: number,
  validator: (s: string) => boolean,
): boolean =>
  arr.length <= maxLen &&
  arr.every((item) => typeof item === "string" && validator(item));

const isValidSearchFilters = (data: unknown): data is SearchFilters => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.language === "string" &&
    VALID_LANGUAGES.includes(obj.language) &&
    typeof obj.source === "string" &&
    VALID_SOURCES.includes(obj.source) &&
    Array.isArray(obj.categories) &&
    isStringArray(obj.categories, 10, (s) => VALID_CATEGORIES.includes(s)) &&
    Array.isArray(obj.years) &&
    isStringArray(obj.years, 20, (s) => YEAR_REGEX.test(s)) &&
    Array.isArray(obj.durationBands) &&
    isStringArray(obj.durationBands, 10, (s) =>
      VALID_DURATION_LABELS.includes(s),
    ) &&
    typeof obj.titleSearch === "string" &&
    (obj.titleSearch as string).length <= 500 &&
    typeof obj.freeOnly === "boolean"
  );
};

const getStoredFilters = (): SearchFilters => {
  const stored = localStorage.getItem(UI_CONFIG.cacheKey);
  if (!stored) return initialFilters;

  try {
    const parsed = JSON.parse(stored);
    return isValidSearchFilters(parsed) ? parsed : initialFilters;
  } catch {
    return initialFilters;
  }
};
const storeFilters = (filters: SearchFilters): void => {
  localStorage.setItem(UI_CONFIG.cacheKey, JSON.stringify(filters));
};
const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>(getStoredFilters());
  const [allMedia, setAllMedia] = useState<MediaResult[]>([]);
  const [displayedMedia, setDisplayedMedia] = useState<MediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(UI_CONFIG.mediaPerLoad);

  const { toast } = useToast();
  const { t } = useTranslation();
  const performSearch = useCallback(
    async (searchFilters: SearchFilters) => {
      setIsLoading(true);
      setVisibleCount(UI_CONFIG.mediaPerLoad);

      try {
        const results = await searchMedia(searchFilters);
        setAllMedia(results);
      } catch {
        toast({
          title: "Search failed",
          description: "Unable to fetch results. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );
  useEffect(() => {
    setDisplayedMedia(allMedia.slice(0, visibleCount));
  }, [allMedia, visibleCount]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          allMedia.length > visibleCount
        ) {
          setVisibleCount((prev) => prev + UI_CONFIG.mediaPerLoad);
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current && allMedia.length > visibleCount) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, allMedia.length, visibleCount]);
  useEffect(() => {
    performSearch(filters);
  }, [filters, performSearch]);
  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: string | string[] | boolean) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };
        storeFilters(newFilters);
        return newFilters;
      });
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    storeFilters(initialFilters);
    setVisibleCount(UI_CONFIG.mediaPerLoad);
  }, []);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-3">
        {/* Filters */}
        <div className="-mt-8 md:-mt-20 relative z-20">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>
        {/* Results Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("results.mediaCount", { count: allMedia.length })}
          </h2>
        </div>
        {/* Media Grid */}
        <div className="space-y-8">
          <MediaGrid
            media={displayedMedia}
            isLoading={isLoading}
            hasSearched={true}
          />
          {/* Infinite scroll trigger */}
          {allMedia.length > displayedMedia.length && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </main>
      {/* Footer */}
      <footer className="py-1 mt-auto">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} techforpeace.co.in
          </p>
        </div>
      </footer>
    </div>
  );
};
export default Index;
