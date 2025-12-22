import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { VideoGrid } from '@/components/VideoGrid';
import { SearchFilters, VideoResult, Language, Source } from '@/types/search';
import { searchVideos } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const initialFilters: SearchFilters = {
  query: '',
  language: '',
  source: '',
  durationBand: '',
  year: '',
};

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setIsLoading(true);
    setHasSearched(true);

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

  const handleSearch = useCallback((query: string) => {
    const newFilters = { ...filters, query };
    setFilters(newFilters);
    performSearch(newFilters);
  }, [filters, performSearch]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Only auto-search if we've already performed a search
    if (hasSearched) {
      performSearch(newFilters);
    }
  }, [filters, hasSearched, performSearch]);

  const handleClearFilters = useCallback(() => {
    const newFilters = { ...initialFilters, query: filters.query };
    setFilters(newFilters);
    
    if (hasSearched) {
      performSearch(newFilters);
    }
  }, [filters.query, hasSearched, performSearch]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <div className="-mt-20 relative z-20">
          <SearchBar onSearch={handleSearch} initialQuery={filters.query} />
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Results */}
        <VideoGrid
          videos={videos}
          isLoading={isLoading}
          hasSearched={hasSearched}
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
