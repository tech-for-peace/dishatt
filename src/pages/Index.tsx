import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { LangCategoryTabs } from "@/components/LangCategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { ActiveSource, SourceTabs } from "@/components/SourceTabs";

import { searchMedia, getUniqueChannels } from "@/lib/data";
import { SearchFilters, MediaResult, DURATION_BANDS } from "@/lib/types";
import { getSourceKey } from "@/lib/sources";
import { useToast } from "@/lib/use-toast";
import { UI_CONFIG } from "@/lib/constants";

const initialFilters: SearchFilters = {
  language: "",
  categories: [],
  channels: [],
  years: [],
  durationBands: [],
  titleSearch: "",
  freeOnly: false,
};

const VALID_LANGUAGES: string[] = ["", "english", "hindi"];
/** Keep Podcast valid so old saved state isn't wiped; UI only offers Video|Music. */
const VALID_CATEGORIES: string[] = ["Video", "Music", "Podcast"];
const UI_CATEGORIES = new Set(["Video", "Music"]);
const VALID_DURATION_LABELS: string[] = DURATION_BANDS.map((b) => b.label);
const YEAR_REGEX = /^\d{4}$/;

const isStringArray = (
  arr: unknown[],
  maxLen: number,
  validator: (s: string) => boolean,
): boolean =>
  arr.length <= maxLen && arr.every((item) => typeof item === "string" && validator(item));

const isValidSearchFilters = (data: unknown): data is SearchFilters => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.language === "string" &&
    VALID_LANGUAGES.includes(obj.language) &&
    Array.isArray(obj.categories) &&
    isStringArray(obj.categories, 10, (s) => VALID_CATEGORIES.includes(s)) &&
    Array.isArray(obj.channels) &&
    isStringArray(obj.channels, 20, (s) => typeof s === "string" && s.length <= 100) &&
    Array.isArray(obj.years) &&
    isStringArray(obj.years, 20, (s) => YEAR_REGEX.test(s)) &&
    Array.isArray(obj.durationBands) &&
    isStringArray(obj.durationBands, 10, (s) => VALID_DURATION_LABELS.includes(s)) &&
    typeof obj.titleSearch === "string" &&
    (obj.titleSearch as string).length <= 500 &&
    typeof obj.freeOnly === "boolean"
  );
};

/**
 * Collapse multi-select history to one category for the word-tab UI.
 * Prefer Video|Music when present; otherwise keep legacy Podcast.
 */
const normalizeCategories = (categories: string[]): string[] => {
  const firstUi = categories.find((c) => UI_CATEGORIES.has(c));
  if (firstUi) return [firstUi];
  if (categories.includes("Podcast")) return ["Podcast"];
  return [];
};

const getStoredFilters = (): SearchFilters => {
  const stored = localStorage.getItem(UI_CONFIG.cacheKey);
  if (!stored) return initialFilters;

  try {
    const parsed = JSON.parse(stored);
    if (!isValidSearchFilters(parsed)) return initialFilters;
    // YouTube channel is single-select; drop non-YouTube values from older multi-select state.
    const youtubeChannels = parsed.channels.filter((c) => getSourceKey(c) === "youtube");
    return {
      ...parsed,
      channels: youtubeChannels.slice(0, 1),
      categories: normalizeCategories(parsed.categories),
    };
  } catch {
    return initialFilters;
  }
};

const storeFilters = (filters: SearchFilters): void => {
  localStorage.setItem(UI_CONFIG.cacheKey, JSON.stringify(filters));
};

const emptyCounts = (): Record<ActiveSource, number> => ({
  all: 0,
  timelessToday: 0,
  youtube: 0,
  intelligentExistence: 0,
  spotify: 0,
});

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>(getStoredFilters());
  const [source, setSource] = useState<ActiveSource>("all");
  const [allMedia, setAllMedia] = useState<MediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(UI_CONFIG.mediaPerLoad);

  const { toast } = useToast();
  const { t } = useTranslation();

  // Channels only narrow the YouTube tab, so keep them out of the search
  // request — otherwise a channel chip click would re-fetch everything.
  const searchFilters = useMemo<SearchFilters>(
    () => ({
      language: filters.language,
      categories: filters.categories,
      years: filters.years,
      durationBands: filters.durationBands,
      titleSearch: filters.titleSearch,
      freeOnly: filters.freeOnly,
      channels: [],
    }),
    [
      filters.language,
      filters.categories,
      filters.years,
      filters.durationBands,
      filters.titleSearch,
      filters.freeOnly,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();

    const doSearch = async () => {
      setIsLoading(true);
      setVisibleCount(UI_CONFIG.mediaPerLoad);

      try {
        const results = await searchMedia(searchFilters);
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
  }, [searchFilters, toast]);

  // Drop persisted YouTube channels that no longer exist in the catalog.
  useEffect(() => {
    let cancelled = false;
    getUniqueChannels().then((channels) => {
      if (cancelled) return;
      const available = new Set(channels.filter((c) => getSourceKey(c) === "youtube"));
      setFilters((prev) => {
        if (prev.channels.length === 0) return prev;
        const next = prev.channels.filter((c) => available.has(c)).slice(0, 1);
        if (next.length === prev.channels.length && next[0] === prev.channels[0]) {
          return prev;
        }
        const newFilters = { ...prev, channels: next };
        storeFilters(newFilters);
        return newFilters;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const sourceCounts = useMemo(() => {
    const counts = emptyCounts();
    counts.all = allMedia.length;
    for (const item of allMedia) {
      counts[getSourceKey(item.channel)] += 1;
    }
    return counts;
  }, [allMedia]);

  const visibleMedia = useMemo(() => {
    let items =
      source === "all"
        ? allMedia
        : allMedia.filter((item) => getSourceKey(item.channel) === source);

    if (source === "youtube" && filters.channels.length > 0) {
      items = items.filter((item) => item.channel && filters.channels.includes(item.channel));
    }

    return items;
  }, [allMedia, source, filters.channels]);

  const displayedMedia = useMemo(
    () => visibleMedia.slice(0, visibleCount),
    [visibleMedia, visibleCount],
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && visibleMedia.length > visibleCount) {
          setVisibleCount((prev) => prev + UI_CONFIG.mediaPerLoad);
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current && visibleMedia.length > visibleCount) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, visibleMedia.length, visibleCount]);

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

  const handleChannelsChange = useCallback((channels: string[]) => {
    setVisibleCount(UI_CONFIG.mediaPerLoad);
    setFilters((prev) => {
      const newFilters = { ...prev, channels };
      storeFilters(newFilters);
      return newFilters;
    });
  }, []);

  const handleSourceChange = useCallback((next: ActiveSource) => {
    setSource(next);
    setVisibleCount(UI_CONFIG.mediaPerLoad);
    // Leaving YouTube clears channel chips so they don't linger invisibly.
    if (next !== "youtube") {
      setFilters((prev) => {
        if (prev.channels.length === 0) return prev;
        const cleared = { ...prev, channels: [] as string[] };
        storeFilters(cleared);
        return cleared;
      });
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    storeFilters(initialFilters);
    setSource("all");
    setVisibleCount(UI_CONFIG.mediaPerLoad);
  }, []);

  const handleLangCategoryClear = useCallback(() => {
    setFilters((prev) => {
      const next = { ...prev, language: "" as const, categories: [] as string[] };
      storeFilters(next);
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/*
        Hero green stretches through the gap above filters and to the filter
        midpoint: mobile 2-row panel → end of first row; md+ 1-row → half row.
        Opaque FilterBar is pulled up with -mt so it straddles the edge.
      */}
      <section className="bg-hero pb-[calc(0.75rem+2.25rem)] md:pb-[calc(1rem+1.125rem)]">
        <Header />
      </section>

      {/* Filters → Browse → Results on page bg */}
      <main className="container mx-auto max-w-6xl flex-1 space-y-3 px-4 -mt-9 pb-3 pt-0 md:-mt-[1.125rem] md:space-y-3.5 md:pb-4">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        <SourceTabs
          activeSource={source}
          onSourceChange={handleSourceChange}
          counts={sourceCounts}
          selectedChannels={filters.channels}
          onChannelsChange={handleChannelsChange}
        />

        {/* Mobile: count under tabs. md+: one line with 4-digit count. */}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-x-3">
          <LangCategoryTabs
            language={filters.language}
            category={filters.categories[0] ?? ""}
            onLanguageChange={(value) => handleFilterChange("language", value)}
            onCategoryChange={(value) => handleFilterChange("categories", value ? [value] : [])}
            onClear={handleLangCategoryClear}
          />
          <h2 className="shrink-0 self-end font-heading text-base font-semibold text-foreground md:ml-auto md:self-auto md:text-xl lg:text-2xl">
            {t("results.mediaCount", { count: visibleMedia.length })}
          </h2>
        </div>

        <div className="space-y-4">
          <MediaGrid media={displayedMedia} isLoading={isLoading} />
          {visibleMedia.length > displayedMedia.length && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto py-1">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} techforpeace.co.in
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
