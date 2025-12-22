import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { SearchFilters, DURATION_BANDS, YEARS, Language, Source } from '@/types/search';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string) => void;
  onClearFilters: () => void;
}

export function FilterPanel({ filters, onFilterChange, onClearFilters }: FilterPanelProps) {
  const activeFiltersCount = [
    filters.language,
    filters.source,
    filters.durationBand,
    filters.year,
  ].filter(Boolean).length;

  return (
    <div className="w-full bg-card rounded-xl p-6 shadow-soft border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl font-semibold text-foreground">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
            Clear all ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Language Filter */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium text-muted-foreground">
            Language
          </Label>
          <Select
            value={filters.language || 'all'}
            onValueChange={(value) => onFilterChange('language', value === 'all' ? '' : value as Language)}
          >
            <SelectTrigger id="language" className="bg-background border-border hover:border-primary/50 transition-colors">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duration Filter */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium text-muted-foreground">
            Duration
          </Label>
          <Select
            value={filters.durationBand || 'all'}
            onValueChange={(value) => onFilterChange('durationBand', value === 'all' ? '' : value)}
          >
            <SelectTrigger id="duration" className="bg-background border-border hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Any Duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_BANDS.map((band) => (
                <SelectItem key={band.label} value={band.label === 'Any Duration' ? 'all' : band.label}>
                  {band.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-medium text-muted-foreground">
            Year
          </Label>
          <Select
            value={filters.year || 'all'}
            onValueChange={(value) => onFilterChange('year', value === 'all' ? '' : value)}
          >
            <SelectTrigger id="year" className="bg-background border-border hover:border-primary/50 transition-colors">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm font-medium text-muted-foreground">
            Source
          </Label>
          <Select
            value={filters.source || 'all'}
            onValueChange={(value) => onFilterChange('source', value === 'all' ? '' : value as Source)}
          >
            <SelectTrigger id="source" className="bg-background border-border hover:border-primary/50 transition-colors">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="timelesstoday">Timeless Today</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {filters.language && (
            <Badge variant="secondary" className="capitalize">
              {filters.language}
              <button
                onClick={() => onFilterChange('language', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.durationBand && (
            <Badge variant="secondary">
              {filters.durationBand}
              <button
                onClick={() => onFilterChange('durationBand', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.year && (
            <Badge variant="secondary">
              {filters.year}
              <button
                onClick={() => onFilterChange('year', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.source && (
            <Badge variant="secondary" className="capitalize">
              {filters.source === 'timelesstoday' ? 'Timeless Today' : 'YouTube'}
              <button
                onClick={() => onFilterChange('source', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
