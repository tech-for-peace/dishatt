import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { Header } from '@/components/Header';
import { FilterPanel } from '@/components/FilterPanel';
import { VideoGrid } from '@/components/VideoGrid';
import { searchVideos } from '@/lib/data';
import { SearchFilters, VideoResult } from '@/types/search';
import { useToast } from '@/hooks/use-toast';
import { useWatchedVideos } from '@/hooks/useWatchedVideos';

const FILTERS_STORAGE_KEY = 'videoSearchFilters';

const initialFilters: SearchFilters = {
  language: '',
  source: '',
  year: '',
  durationBand: '',
  titleSearch: '',
};

const getStoredFilters = (): SearchFilters => {
  const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialFilters;
    }
  }
  return initialFilters;
};

const storeFilters = (filters: SearchFilters) => {
  localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
};

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>(getStoredFilters());
  const [allVideos, setAllVideos] = useState<VideoResult[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    watchedIds,
    showWatched,
    watchedCount,
    markAsWatched,
    unmarkAsWatched,
    isWatched,
    toggleShowWatched,
  } = useWatchedVideos();

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    try {
      const results = await searchVideos(searchFilters);
      setAllVideos(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Unable to fetch results. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Filter videos based on watched status
  const filteredVideos = useMemo(() => {
    if (showWatched) {
      return allVideos;
    }
    return allVideos.filter((video) => !isWatched(video.id));
  }, [allVideos, showWatched, isWatched, watchedIds]);

  // Update displayed videos when filteredVideos or visibleCount changes
  useEffect(() => {
    setDisplayedVideos(filteredVideos.slice(0, visibleCount));
  }, [filteredVideos, visibleCount]);

  const handleLoadMore = useCallback(() => {
    const newCount = visibleCount + 10;
    setVisibleCount(newCount);
  }, [visibleCount]);

  // Load initial results on mount and when filters change
  useEffect(() => {
    performSearch(filters);
  }, [filters, performSearch]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    storeFilters(newFilters);
    performSearch(newFilters);
  }, [filters, performSearch]);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    storeFilters(initialFilters);
    setVisibleCount(10);
  }, []);

  const handleToggleWatched = useCallback((videoId: string, watched: boolean) => {
    if (watched) {
      markAsWatched(videoId);
    } else {
      unmarkAsWatched(videoId);
    }
  }, [markAsWatched, unmarkAsWatched]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Filters */}
        <div className="-mt-20 relative z-20">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Results Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {t('results.videoCount', { count: filteredVideos.length })}
          </h2>

          {/* Show Watched Toggle */}
          <button
            onClick={toggleShowWatched}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showWatched
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            aria-label={showWatched ? t('results.hideWatched') : t('results.showWatched')}
          >
            {showWatched ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {showWatched
              ? t('results.hideWatched')
              : t('results.showWatched', { count: watchedCount })}
          </button>
        </div>

        {/* Video Grid */}
        <div className="space-y-8">
          <VideoGrid
            videos={displayedVideos}
            isLoading={isLoading}
            hasSearched={true}
            watchedIds={watchedIds}
            onToggleWatched={handleToggleWatched}
          />

          {/* Load More Button */}
          {filteredVideos.length > displayedVideos.length && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('results.loading') : t('results.loadMore')}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-1 mt-auto">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aman Mangal
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
