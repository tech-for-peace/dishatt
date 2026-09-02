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
  const containerClass = "min-h-[200px]";

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-border bg-card shadow-soft"
            >
              <div className="aspect-video bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className={`${containerClass} animate-fade-in py-8 text-center`}>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <p className="py-8 text-center text-muted-foreground">
          {t("results.noMediaMessage")}
        </p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {media.map((item, index) => (
          <MediaCard key={item.id} media={item} index={index} />
        ))}
      </div>
    </div>
  );
}
