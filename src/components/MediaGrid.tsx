import { useTranslation } from "react-i18next";
import { Compass } from "lucide-react";
import { MediaResult } from "@/lib/types";
import { MediaCard } from "./MediaCard";
interface MediaGridProps {
  media: MediaResult[];
  isLoading: boolean;
}
export function MediaGrid({ media, isLoading }: MediaGridProps) {
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
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className={`${containerClass} text-center py-16 animate-fade-in`}>
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10
                         flex items-center justify-center"
        >
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <p className="text-muted-foreground text-center py-8">
          {t("results.noMediaMessage")}
        </p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((media, index) => (
          <MediaCard key={media.id} media={media} index={index} />
        ))}
      </div>
    </div>
  );
}
