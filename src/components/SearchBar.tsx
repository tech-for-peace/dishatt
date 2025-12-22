import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function SearchBar({ onSearch, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for wisdom, meditation, inner peace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-4 h-14 text-lg bg-card border-2 border-border rounded-xl shadow-soft focus:border-primary focus:shadow-glow transition-all duration-300"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-soft hover:shadow-card transition-all duration-300"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
