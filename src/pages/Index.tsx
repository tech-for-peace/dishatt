import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FilterPanel } from '@/components/FilterPanel';
import { VideoGrid } from '@/components/VideoGrid';
import { SearchFilters, VideoResult } from '@/types/search';
import { searchVideos } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const initialFilters: SearchFilters = {
  language: '',
  source: '',
  durationBand: '',
  year: '',
};

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true);

    try {
      const response = await searchVideos(searchFilters);
      setVideos(response.results);
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

  // Load initial results on mount
  useEffect(() => {
    performSearch(filters);
  }, []);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    performSearch(newFilters);
  }, [filters, performSearch]);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    performSearch(initialFilters);
  }, [performSearch]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Filters */}
        <div className="-mt-20 relative z-20">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results */}
        <VideoGrid
          videos={videos}
          isLoading={isLoading}
          hasSearched={true}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Disha. Your compass to wisdom and inner peace.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
