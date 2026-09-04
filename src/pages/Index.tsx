import { useState, useCallback, useEffect, useMemo } from "react";

import { Header } from "@/components/Header";
import { FilterPanel } from "@/components/FilterPanel";
import { MediaRows } from "@/components/MediaRows";

import { searchMedia } from "@/lib/data";
import { SearchFilters, MediaResult, DURATION_BANDS } from "@/lib/types";
import { useToast } from "@/lib";
import { HIDDEN_CATEGORIES, UI_CONFIG } from "@/lib/constants";

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

const isValidSearchFilters = (data: unknown): data is SearchFilters => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.language === "string" &&
    VALID_LANGUAGES.includes(obj.language) &&
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
    if (!isValidSearchFilters(parsed)) return initialFilters;
    // Drop categories that no longer have a pill, otherwise a previously
    // selected one would stay applied with no way to switch it off.
    return {
      ...parsed,
      categories: parsed.categories.filter(
        (c) => !HIDDEN_CATEGORIES.includes(c),
      ),
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

  const { toast } = useToast();

  // `channels` is deliberately excluded: it only narrows the YouTube rail, so
  // applying it globally would empty the other rails. Keeping it out of this
  // memo also stops a channel pill click from re-running the search and
  // resetting every rail's scroll position.
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

  const handleChannelsChange = useCallback(
    (channels: string[]) => handleFilterChange("channels", channels),
    [handleFilterChange],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    storeFilters(initialFilters);
  }, []);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-4 md:py-8 space-y-6">
        {/* Filters */}
        <div className="-mt-8 md:-mt-20 relative z-20">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>
        {/* Rails grouped by source */}
        <MediaRows
          media={allMedia}
          isLoading={isLoading}
          selectedChannels={filters.channels}
          onChannelsChange={handleChannelsChange}
        />
      </main>
      {/* Footer */}
      <footer className="py-1 mt-auto">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} techforpeace.co.in
          </p>
        </div>
      </footer>
    </div>
  );
};
export default Index;
