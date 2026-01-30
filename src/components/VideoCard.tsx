import { useTranslation } from "react-i18next";
import { Calendar, Globe, Play, Sparkles, Headphones } from "lucide-react";
import { VideoResult } from "@/lib/types";
import { Badge } from "./ui/badge";
import { formatLanguage, markVideoAsClicked } from "@/lib/data";

// WhatsApp icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    let shareUrl = video.url;
    if (shareUrl.includes("timelesstoday.tv")) {
      shareUrl = shareUrl.replace("//www.", "//");
    }
    
    const shareText = `${video.title} - ${shareUrl}`;
    
    // Always use direct WhatsApp URL to avoid browser attribution (e.g., "sent from Firefox")
    openWhatsAppShare(shareText);
  };

  const openWhatsAppShare = (text: string) => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
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
              className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 ml-1"
              aria-label="Share on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
