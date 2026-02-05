import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/components/Header";
import { FilterPanel } from "@/components/FilterPanel";
import { VideoGrid } from "@/components/VideoGrid";

import { searchVideos } from "@/lib/data";
import { SearchFilters, VideoResult } from "@/lib/types";
import { useToast } from "@/lib";
import { UI_CONFIG } from "@/lib/constants";

const initialFilters: SearchFilters = {
  language: "",
  source: "",
  years: [],
  durationBands: [],
  titleSearch: "",
  freeOnly: false,
};

const isValidSearchFilters = (data: unknown): data is SearchFilters => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    (typeof obj.language === "string" || obj.language === "") &&
    (typeof obj.source === "string" || obj.source === "") &&
    Array.isArray(obj.years) &&
    Array.isArray(obj.durationBands) &&
    typeof obj.titleSearch === "string" &&
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
  const [allVideos, setAllVideos] = useState<VideoResult[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(UI_CONFIG.videosPerLoad);

  const { toast } = useToast();
  const { t } = useTranslation();
  const performSearch = useCallback(
    async (searchFilters: SearchFilters) => {
      setIsLoading(true);
      setVisibleCount(UI_CONFIG.videosPerLoad);

      try {
        const results = await searchVideos(searchFilters);
        setAllVideos(results);
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
    setDisplayedVideos(allVideos.slice(0, visibleCount));
  }, [allVideos, visibleCount]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          allVideos.length > visibleCount
        ) {
          setVisibleCount((prev) => prev + UI_CONFIG.videosPerLoad);
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current && allVideos.length > visibleCount) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, allVideos.length, visibleCount]);
  useEffect(() => {
    performSearch(filters);
  }, [filters, performSearch]);
  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: string | string[] | boolean) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      storeFilters(newFilters);
      performSearch(newFilters);
    },
    [filters, performSearch],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    storeFilters(initialFilters);
    setVisibleCount(UI_CONFIG.videosPerLoad);
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
            {t("results.videoCount", { count: allVideos.length })}
          </h2>
        </div>
        {/* Video Grid */}
        <div className="space-y-8">
          <VideoGrid
            videos={displayedVideos}
            isLoading={isLoading}
            hasSearched={true}
          />
          {/* Infinite scroll trigger */}
          {allVideos.length > displayedVideos.length && (
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
