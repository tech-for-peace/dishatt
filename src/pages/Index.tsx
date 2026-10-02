import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { MediaGrid } from "@/components/MediaGrid";
import { SourcePicker } from "@/components/SourcePicker";
import { BackButton } from "@/components/BackButton";
import { SortToggle } from "@/components/SortToggle";
import { Button } from "@/components/ui/button";

import {
  loadAllMedia,
  filterMedia,
  getFacets,
  sanitizeFiltersAgainstFacets,
  sortMedia,
} from "@/lib/data";
import { SearchFilters, MediaResult, SortOrder } from "@/lib/types";
import {
  ActiveSource,
  getSourceKey,
  isActiveSource,
  mediaForSource,
  SOURCE_ORDER,
} from "@/lib/sources";
import {
  INITIAL_FILTERS,
  isValidCategory,
  loadStoredFilters,
  storeFilters,
} from "@/lib/stored-filters";
import { UI_CONFIG } from "@/lib/constants";

const emptyCounts = (): Record<ActiveSource, number> =>
  Object.fromEntries([["all", 0], ...SOURCE_ORDER.map((key) => [key, 0])]) as Record<
    ActiveSource,
    number
  >;

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sourceParam = searchParams.get("source");
  const categoryParam = searchParams.get("category");
  const selectedSource: ActiveSource | null = isActiveSource(sourceParam) ? sourceParam : null;
  const urlCategory = isValidCategory(categoryParam) ? categoryParam : undefined;

  const [filters, setFilters] = useState<SearchFilters>(() => {
    // Deep link ?source=…&category=Music wins over stale localStorage.
    if (selectedSource && urlCategory) {
      return { ...INITIAL_FILTERS, categories: [urlCategory] };
    }
    return loadStoredFilters();
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [catalog, setCatalog] = useState<MediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(UI_CONFIG.mediaPerLoad);

  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    loadAllMedia()
      .then((results) => {
        if (cancelled) return;
        setCatalog(results);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCatalog([]);
        setLoadFailed(true);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Each picker step is a new "page": start at the top instead of keeping the old scroll.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedSource, urlCategory]);

  // Drop invalid query params (e.g. ?source=tiktok).
  useEffect(() => {
    if (sourceParam !== null && !isActiveSource(sourceParam)) {
      setSearchParams({}, { replace: true });
    }
  }, [sourceParam, setSearchParams]);

  const sourceCounts = useMemo(() => {
    const counts = emptyCounts();
    counts.all = catalog.length;
    for (const item of catalog) {
      counts[getSourceKey(item.channel)] += 1;
    }
    return counts;
  }, [catalog]);

  const facetCategories = useMemo(() => {
    if (urlCategory) return [urlCategory];
    return filters.categories.length > 0 ? filters.categories : undefined;
  }, [urlCategory, filters.categories]);

  const facets = useMemo(() => {
    if (!selectedSource) {
      return getFacets([], "all");
    }
    return getFacets(catalog, selectedSource, facetCategories);
  }, [catalog, selectedSource, facetCategories]);

  // Always present FilterBar / search with values valid for the active source.
  // The URL category wins over stored filters, so Back/Forward between
  // ?category=Music and ?category=Video stays in sync without a remount.
  const activeFilters = useMemo(
    () =>
      sanitizeFiltersAgainstFacets(
        urlCategory ? { ...filters, categories: [urlCategory] } : filters,
        facets,
      ),
    [filters, facets, urlCategory],
  );

  const visibleMedia = useMemo(() => {
    if (!selectedSource) return [];
    const scoped = mediaForSource(catalog, selectedSource);
    return sortMedia(filterMedia(scoped, activeFilters), sortOrder);
  }, [catalog, selectedSource, activeFilters, sortOrder]);

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
      setVisibleCount(UI_CONFIG.mediaPerLoad);
      setFilters((prev) => {
        const base = sanitizeFiltersAgainstFacets(prev, facets);
        const newFilters = { ...base, [key]: value };
        storeFilters(newFilters);
        return newFilters;
      });
    },
    [facets],
  );

  const handleSortChange = useCallback((order: SortOrder) => {
    setSortOrder(order);
    setVisibleCount(UI_CONFIG.mediaPerLoad);
  }, []);

  const handleSelectSource = useCallback(
    (source: ActiveSource, category?: string) => {
      const nextFacets = getFacets(catalog, source, category ? [category] : undefined);
      // Sanitizing also preselects the sole language (Spotify / Apple are English-only).
      const next = sanitizeFiltersAgainstFacets(
        { ...INITIAL_FILTERS, categories: category ? [category] : [] },
        nextFacets,
      );
      setFilters(next);
      storeFilters(next);
      setSortOrder("newest");
      setVisibleCount(UI_CONFIG.mediaPerLoad);
      const params: Record<string, string> = { source };
      if (category) params.category = category;
      setSearchParams(params);
    },
    [catalog, setSearchParams],
  );

  const handleChangeSource = useCallback(() => {
    setVisibleCount(UI_CONFIG.mediaPerLoad);
    setSearchParams({});
  }, [setSearchParams]);

  const handleResetFilters = useCallback(() => {
    const next = sanitizeFiltersAgainstFacets(
      { ...INITIAL_FILTERS, categories: urlCategory ? [urlCategory] : [] },
      facets,
    );
    setFilters(next);
    storeFilters(next);
    setVisibleCount(UI_CONFIG.mediaPerLoad);
  }, [urlCategory, facets]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main
        className={
          selectedSource === null
            ? "flex-1 container max-w-6xl mx-auto w-full px-4 py-3 md:py-4 space-y-2.5"
            : // No top padding — FilterBar’s fixed -mt-8 owns the hero overlap on every width
              "flex-1 container max-w-6xl mx-auto w-full px-4 pb-3 pt-0 md:pb-4 space-y-2.5"
        }
      >
        {loadFailed ? (
          <div className="py-16 text-center" role="alert">
            <p className="text-muted-foreground">{t("results.loadError")}</p>
            <Button
              className="mt-4"
              onClick={() => {
                setIsLoading(true);
                setLoadFailed(false);
                setReloadKey((key) => key + 1);
              }}
            >
              {t("results.retry")}
            </Button>
          </div>
        ) : selectedSource === null ? (
          <SourcePicker
            catalog={catalog}
            counts={sourceCounts}
            onSelect={handleSelectSource}
            isLoading={isLoading}
          />
        ) : (
          <>
            <FilterBar
              filters={activeFilters}
              facets={facets}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <BackButton onClick={handleChangeSource} />
              <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                {t("results.mediaCount", { count: visibleMedia.length })}
              </h2>
              <div className="ml-auto">
                <SortToggle order={sortOrder} onChange={handleSortChange} />
              </div>
            </div>

            <div className="space-y-4">
              <MediaGrid media={displayedMedia} isLoading={isLoading} />
              {visibleMedia.length > displayedMedia.length && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <footer className="py-1 mt-auto">
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
