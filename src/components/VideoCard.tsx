import { Play, Clock, Calendar, Globe } from 'lucide-react';
import { VideoResult } from '@/types/search';
import { formatDuration } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface VideoCardProps {
  video: VideoResult;
  index: number;
}

export function VideoCard({ video, index }: VideoCardProps) {
  return (
    <div
      className="group bg-card rounded-xl overflow-hidden shadow-soft border border-border hover:shadow-card hover:border-primary/30 transition-all duration-300 cursor-pointer animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="h-6 w-6 text-primary-foreground ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-foreground/80 text-background text-xs font-medium">
          {formatDuration(video.duration)}
        </div>

        {/* Source Badge */}
        <Badge
          variant="secondary"
          className={`absolute top-3 left-3 text-xs ${
            video.source === 'youtube'
              ? 'bg-destructive/90 text-destructive-foreground'
              : 'bg-primary/90 text-primary-foreground'
          }`}
        >
          {video.source === 'youtube' ? 'YouTube' : 'Timeless Today'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {video.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {video.publishedYear}
          </span>
          <span className="flex items-center gap-1 capitalize">
            <Globe className="h-3.5 w-3.5" />
            {video.language}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(video.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
