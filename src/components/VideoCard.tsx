import { Play, Clock, Calendar, Globe, Sparkles } from 'lucide-react';
import { format, isThisMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { VideoResult } from '@/types/search';
import { formatLanguage } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

// Helper function to format duration
const formatDuration = (minutes: number, language: string): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (language === 'hi') {
    if (hours > 0) {
      return `${hours} घंटे ${mins} मिनट`;
    }
    return `${mins} मिनट`;
  }

  // English formatting
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Date formatter - always use English for dates
const formatDate = (date: Date): string => {
  return format(date, 'MMM yyyy', { locale: enUS });
};

interface VideoCardProps {
  video: VideoResult;
  index: number;
}

export function VideoCard({ video, index }: VideoCardProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const videoDate = new Date(video.publishedYear, video.publishedMonth ? video.publishedMonth - 1 : 0, 1);
  const isNew = isThisMonth(videoDate);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    let url = video.url;

    // Ensure timelesstoday.tv URLs don't have www
    if (url.includes('timelesstoday.tv')) {
      url = url.replace('//www.', '//');
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-card rounded-xl overflow-hidden shadow-soft border border-border hover:shadow-card hover:border-primary/30 transition-all duration-300 cursor-pointer animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          width={355}
          height={200}
          loading={index < 3 ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="h-6 w-6 text-primary-foreground ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-foreground/80 text-background text-xs font-medium">
          {formatDuration(video.duration, currentLanguage)}
        </div>

        {/* Source Badge */}
        <Badge
          variant="secondary"
          className={`absolute top-3 left-3 text-xs font-medium ${
            video.source === 'youtube'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          {video.source === 'youtube' ? t('videoCard.youtube') : t('videoCard.timelessToday')}
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
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            {formatDate(videoDate)}
            {isNew && (
              <Badge variant="default" className="ml-1 bg-green-600 hover:bg-green-700 text-xs h-4 px-1.5">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                {t('results.new')}
              </Badge>
            )}
          </span>
          <span className="flex items-center gap-1 capitalize">
            <Globe className="h-3.5 w-3.5" />
            {formatLanguage(video.language)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(video.duration, currentLanguage)}
          </span>
        </div>
      </div>
    </div>
  );
}
