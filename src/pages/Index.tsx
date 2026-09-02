import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { FilterPanel } from "@/components/FilterPanel";
import { MediaGrid } from "@/components/MediaGrid";
import { BuildInfo } from "@/components/BuildInfo";

import { searchMedia } from "@/lib/data";
import { SearchFilters, MediaResult, DURATION_BANDS } from "@/lib/types";
import { useToast } from "@/lib/use-toast";
import { UI_CONFIG } from "@/lib/constants";

const initialFilters: SearchFilters = {
  languages: [],
  categories: [],
  channels: [],
  years: [],
  durationBands: [],
  titleSearch: "",
  searchTokens: [],
  freeOnly: false,
};

const VALID_LANGUAGES: string[] = ["english", "hindi"];
const VALID_CATEGORIES: string[] = ["Video", "Music", "Podcast"];
const VALID_DURATION_LABELS: string[] = DURATION_BANDS.map((b) => b.label);
const YEAR_REGEX = /^\d{4}$/;

const isStringArray = (
  arr: unknown[],
  maxLen: number,
  validator: (s: string) => boolean,
): boolean =>
  arr.length <= maxLen &&
  arr.every((item) => typeof item === "string" && validator(item));

const isValidSearchFilters = (data: unknown): boolean => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    ((Array.isArray(obj.languages) &&
      isStringArray(obj.languages, 2, (s) => VALID_LANGUAGES.includes(s))) ||
      (typeof obj.language === "string" &&
        (obj.language === "" || VALID_LANGUAGES.includes(obj.language)))) &&
    Array.isArray(obj.categories) &&
    isStringArray(obj.categories, 10, (s) => VALID_CATEGORIES.includes(s)) &&
    Array.isArray(obj.channels) &&
    isStringArray(
      obj.channels,
      20,
      (s) => typeof s === "string" && s.length <= 100,
    ) &&
    Array.isArray(obj.years) &&
    isStringArray(obj.years, 20, (s) => YEAR_REGEX.test(s)) &&
    Array.isArray(obj.durationBands) &&
    isStringArray(obj.durationBands, 10, (s) => s.length <= 40) &&
    typeof obj.titleSearch === "string" &&
    (obj.titleSearch as string).length <= 500 &&
    (obj.searchTokens === undefined ||
      (Array.isArray(obj.searchTokens) &&
        isStringArray(obj.searchTokens, 20, (s) => s.length <= 100))) &&
    typeof obj.freeOnly === "boolean"
  );
};

const getStoredFilters = (): SearchFilters => {
  const stored = localStorage.getItem(UI_CONFIG.cacheKey);
  if (!stored) return initialFilters;

  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    if (!isValidSearchFilters(parsed)) return initialFilters;
    const searchTokens =
      Array.isArray(parsed.searchTokens) && parsed.searchTokens.length > 0
        ? (parsed.searchTokens as string[])
        : typeof parsed.titleSearch === "string" && parsed.titleSearch
          ? [parsed.titleSearch]
          : [];
    const languages = Array.isArray(parsed.languages)
      ? (parsed.languages as SearchFilters["languages"])
      : typeof parsed.language === "string" && parsed.language
        ? [parsed.language as SearchFilters["languages"][number]]
        : [];
    return {
      ...(parsed as unknown as SearchFilters),
      languages,
      searchTokens,
      titleSearch: searchTokens.join(" "),
      durationBands: Array.isArray(parsed.durationBands)
        ? (parsed.durationBands as string[]).filter((band) =>
            VALID_DURATION_LABELS.includes(band),
          )
        : [],
    };
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
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(UI_CONFIG.mediaPerLoad);

  const { toast } = useToast();
  const { t } = useTranslation();
  const displayedMedia = useMemo(
    () => allMedia.slice(0, visibleCount),
    [allMedia, visibleCount],
  );
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
    const controller = new AbortController();

    const doSearch = async () => {
      setIsLoading(true);
      setVisibleCount(UI_CONFIG.mediaPerLoad);

      try {
        const results = await searchMedia(filters);
        if (!controller.signal.aborted) {
          setAllMedia(results);
        }
      } catch {
        if (!controller.signal.aborted) {
          toast({
            title: "Search failed",
            description: "Unable to fetch results. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    doSearch();

    return () => controller.abort();
  }, [filters, toast]);

  const handleFiltersChange = useCallback((patch: Partial<SearchFilters>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...patch };
      storeFilters(newFilters);
      return newFilters;
    });
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: string | string[] | boolean) => {
      handleFiltersChange({ [key]: value });
    },
    [handleFiltersChange],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    storeFilters(initialFilters);
    setVisibleCount(UI_CONFIG.mediaPerLoad);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-6 pt-3">
        <h2 className="mb-3 text-2xl font-bold text-foreground">
          {t("results.mediaCount", { count: allMedia.length })}
        </h2>
        <div className="space-y-4">
          <MediaGrid media={displayedMedia} isLoading={isLoading} />
          {allMedia.length > displayedMedia.length && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </main>
      <footer className="mt-auto py-3">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} techforpeace.co.in
          </p>
          <BuildInfo />
        </div>
      </footer>
    </div>
  );
};

export default Index;
