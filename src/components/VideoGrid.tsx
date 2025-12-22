import { VideoResult } from '@/types/search';
import { VideoCard } from './VideoCard';
import { Compass } from 'lucide-react';

interface VideoGridProps {
  videos: VideoResult[];
  isLoading: boolean;
  hasSearched: boolean;
}

export function VideoGrid({ videos, isLoading, hasSearched }: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl overflow-hidden shadow-soft border border-border animate-pulse"
          >
            <div className="aspect-video bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="flex gap-4 pt-2">
                <div className="h-3 bg-muted rounded w-16" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hasSearched && videos.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <Compass className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">
          No videos found
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Try adjusting your search terms or filters to discover more content.
        </p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">
          Begin your journey
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Search for wisdom, meditation guides, or spiritual teachings to start exploring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found <span className="font-medium text-foreground">{videos.length}</span> video{videos.length !== 1 ? 's' : ''}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} />
        ))}
      </div>
    </div>
  );
}
