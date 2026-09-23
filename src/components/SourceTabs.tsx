import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { useTranslation } from "react-i18next";

import { AllSourcesIcon, SpotifyIcon, YoutubeIcon } from "@/components/icons/source-icons";
import { getUniqueChannels } from "@/lib/data";
import {
  formatChannelLabel,
  getSourceKey,
  SOURCE_LABEL_KEY,
  SOURCE_ORDER,
  SourceKey,
  youtubeChannelLogoUrl,
} from "@/lib/sources";
import { cn } from "@/lib/utils";

export type ActiveSource = SourceKey | "all";

type SourceIcon = ComponentType<SVGProps<SVGSVGElement>>;

type SourceVisual = { kind: "icon"; Icon: SourceIcon } | { kind: "logo"; src: string };

const SOURCE_VISUAL: Record<ActiveSource, SourceVisual> = {
  all: { kind: "icon", Icon: AllSourcesIcon },
  timelessToday: {
    kind: "logo",
    src: "https://timelesstoday.tv/en/Logo_Light_Mode.webp",
  },
  youtube: { kind: "icon", Icon: YoutubeIcon },
  intelligentExistence: {
    kind: "logo",
    src: "https://www.intelligentexistence.com/wp-content/uploads/2023/08/IE_Logo_%C2%AE_light.png",
  },
  spotify: { kind: "icon", Icon: SpotifyIcon },
};

const TAB_KEYS: ActiveSource[] = ["all", ...SOURCE_ORDER];

interface SourceTabsProps {
  activeSource: ActiveSource;
  onSourceChange: (source: ActiveSource) => void;
  counts: Record<ActiveSource, number>;
  selectedChannels: string[];
  onChannelsChange: (channels: string[]) => void;
}

export function SourceTabs({
  activeSource,
  onSourceChange,
  counts,
  selectedChannels,
  onChannelsChange,
}: SourceTabsProps) {
  const { t } = useTranslation();
  const [youtubeChannels, setYoutubeChannels] = useState<string[]>([]);

  useEffect(() => {
    getUniqueChannels().then((channels) => {
      setYoutubeChannels(channels.filter((c) => getSourceKey(c) === "youtube"));
    });
  }, []);

  const selectChannel = (channel: string) => {
    // Single-select: clicking the active channel clears back to all.
    onChannelsChange(selectedChannels[0] === channel ? [] : [channel]);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex w-full flex-nowrap items-stretch gap-1 overflow-hidden sm:gap-2">
        {TAB_KEYS.map((key) => {
          const visual = SOURCE_VISUAL[key];
          const isActive = activeSource === key;
          const label = key === "all" ? t("sources.all") : t(SOURCE_LABEL_KEY[key]);

          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              aria-label={`${label}, ${counts[key]}`}
              title={`${label} (${counts[key]})`}
              onClick={() => onSourceChange(key)}
              className={cn(
                "inline-flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-none border-2 bg-card px-1 py-1.5 text-foreground shadow-sm transition-all",
                "sm:h-11 sm:flex-row sm:gap-2 sm:px-2 sm:py-0",
                "cursor-pointer select-none active:translate-y-px active:shadow-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "border-foreground ring-2 ring-foreground/20 ring-offset-1 ring-offset-background"
                  : "border-border opacity-70 hover:opacity-100 hover:border-foreground/40",
              )}
            >
              {visual.kind === "logo" ? (
                <img
                  src={visual.src}
                  alt=""
                  width={24}
                  height={24}
                  className="h-5 w-5 shrink-0 object-cover object-left sm:h-6 sm:w-6"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <visual.Icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
              )}
              <span className="text-center text-[10px] font-medium leading-tight sm:text-left sm:text-xs">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {activeSource === "youtube" && youtubeChannels.length > 0 && (
        <div className="flex animate-fade-in flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={selectedChannels.length === 0}
            onClick={() => onChannelsChange([])}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center rounded-none border-2 px-2.5 text-xs font-medium shadow-sm transition-all active:translate-y-px",
              selectedChannels.length === 0
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground opacity-70 hover:opacity-100",
            )}
          >
            {t("sources.channelAll")}
          </button>
          {youtubeChannels.map((channel) => {
            const selected = selectedChannels[0] === channel;
            const logoUrl = youtubeChannelLogoUrl(channel);
            return (
              <button
                key={channel}
                type="button"
                aria-pressed={selected}
                onClick={() => selectChannel(channel)}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-none border-2 px-2 text-xs font-medium shadow-sm transition-all active:translate-y-px",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground opacity-70 hover:opacity-100",
                )}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] shrink-0 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <YoutubeIcon className="h-4 w-4 shrink-0" />
                )}
                {formatChannelLabel(channel)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
