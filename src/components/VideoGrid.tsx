import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { VideoResult } from '@/lib/types';
import { VideoCard } from './VideoCard';
interface VideoGridProps {
  videos: VideoResult[];
  isLoading: boolean;
  hasSearched: boolean;
}
export function VideoGrid({ videos, isLoading, hasSearched }: VideoGridProps) {
  const { t } = useTranslation();
  // Container with min-height to prevent layout shifts
  const containerClass = "min-h-[600px]";
  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl overflow-hidden shadow-soft border border-border
                       animate-pulse"
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
      </div>
    );
  }
  if (hasSearched && videos.length === 0) {
    return (
      <div className={`${containerClass} text-center py-16 animate-fade-in`}>
        <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">
          {t('results.noVideosFound')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('results.noVideosMessage')}
        </p>
      </div>
    );
  }
  if (!hasSearched) {
    return (
      <div className={`${containerClass} text-center py-16 animate-fade-in`}>
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10
                         flex items-center justify-center">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <p className="text-muted-foreground text-center py-8">
          {hasSearched
            ? t('results.videoCount', { count: videos.length })
            : t('results.useFilters')}
        </p>
      </div>
    );
  }
  return (
    <div className={containerClass}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
