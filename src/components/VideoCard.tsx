import { useTranslation } from "react-i18next";
import { Calendar, Globe, Play, Sparkles, Headphones, Share2 } from "lucide-react";
import { VideoResult } from "@/lib/types";
import { Badge } from "./ui/badge";
import { formatLanguage, markVideoAsClicked } from "@/lib/data";

// Language-aware duration formatting
function formatDuration(minutes: number, language: string): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (language === "hi") {
    if (hours > 0 && mins > 0) return `${hours} घंटे ${mins} मिनट`;
    if (hours > 0) return `${hours} घंटे`;
    return `${mins} मिनट`;
  }
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

function formatDate(date: Date, hasDay: boolean): string {
  if (hasDay) {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

interface VideoCardProps {
  video: VideoResult;
  index: number;
}

export function VideoCard({ video, index }: VideoCardProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const videoDate = new Date(
    video.publishedYear,
    video.publishedMonth ?? 0,
    video.publishedDay ?? 1,
  );
  const hasDay = video.publishedDay !== undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Mark video as clicked (removes NEW badge)
    markVideoAsClicked(video.id);
    
    let url = video.url;
    // Ensure timelesstoday.tv URLs don't have www
    if (url.includes("timelesstoday.tv")) {
      url = url.replace("//www.", "//");
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    let shareUrl = video.url;
    if (shareUrl.includes("timelesstoday.tv")) {
      shareUrl = shareUrl.replace("//www.", "//");
    }
    
    const shareText = `${video.title} - ${shareUrl}`;
    
    // Try to share with thumbnail image using Web Share API
    if (navigator.share && navigator.canShare) {
      try {
        // Fetch the thumbnail image
        const response = await fetch(video.thumbnail);
        const blob = await response.blob();
        const file = new File([blob], 'thumbnail.jpg', { type: blob.type });
        
        const shareData = {
          text: shareText,
          files: [file],
        };
        
        // Check if sharing files is supported
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (error) {
        // If file sharing fails, fall back to WhatsApp URL
        console.log('File sharing failed, using WhatsApp URL fallback');
      }
    }
    
    // Fallback to direct WhatsApp URL
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
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
            video.source === "youtube"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : video.source === "spotify"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-amber-700 hover:bg-amber-800 text-white"
          }`}
        >
          {video.source === "youtube"
            ? t("videoCard.youtube")
            : video.source === "spotify"
              ? t("videoCard.spotify")
              : t("videoCard.timelessToday")}
        </Badge>
        {/* New Badge */}
        {video.isNew && (
          <Badge
            variant="default"
            className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-700 text-xs h-5 px-2"
          >
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            {t("results.new")}
          </Badge>
        )}
      </div>
      {/* Content */}
      <div className="px-3 pt-1 pb-1 flex flex-col h-[90px]">
        <div className="flex-grow">
          <h3 className="font-heading text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {video.title}
          </h3>
        </div>
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              {formatDate(videoDate, hasDay)}
            </span>
            <span className="flex items-center gap-1 capitalize">
              <Globe className="h-3.5 w-3.5" />
              {formatLanguage(video.language)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {video.audioOnly && (
              <Badge
                variant="secondary"
                className="bg-pink-500 hover:bg-pink-600 text-white text-xs h-5 px-2"
              >
                <Headphones className="h-2.5 w-2.5 mr-1" />
                Audio only
              </Badge>
            )}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full bg-primary hover:bg-primary/80 text-primary-foreground transition-colors duration-200 ml-1 md:hidden"
              aria-label="Share video"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
