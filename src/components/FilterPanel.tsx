import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SearchFilters, DURATION_BANDS, YEARS, Language, Source } from '@/types/search';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string) => void;
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  return (
    <div className="w-full bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-border/50 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          value={filters.language || 'all'}
          onValueChange={(value) => onFilterChange('language', value === 'all' ? '' : value as Language)}
        >
          <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors h-9">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.durationBand || 'all'}
          onValueChange={(value) => onFilterChange('durationBand', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors h-9">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_BANDS.map((band) => (
              <SelectItem key={band.label} value={band.label === 'Any Duration' ? 'all' : band.label}>
                {band.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.year || 'all'}
          onValueChange={(value) => onFilterChange('year', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors h-9">
            <SelectValue placeholder="Year" />
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

        <Select
          value={filters.source || 'all'}
          onValueChange={(value) => onFilterChange('source', value === 'all' ? '' : value as Source)}
        >
          <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors h-9">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="timelesstoday">Timeless Today</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text Search */}
      <div className="mt-3">
        <Input
          placeholder="Search in title (optional)..."
          value={filters.titleSearch}
          onChange={(e) => onFilterChange('titleSearch', e.target.value)}
          className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
