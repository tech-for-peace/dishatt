import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Compass, ListFilter } from "lucide-react";

import { MediaResult } from "@/lib/types";
import { getUniqueChannels } from "@/lib/data";
import {
  formatChannelLabel,
  getSourceKey,
  SOURCE_LABEL_KEY,
  SOURCE_ORDER,
  SourceKey,
} from "@/lib/sources";
import { FilterPill } from "@/components/ui/filter-pill";
import { MediaRow } from "./MediaRow";

type Buckets = Record<SourceKey, MediaResult[]>;

const emptyBuckets = (): Buckets => ({
  timelessToday: [],
  youtube: [],
  intelligentExistence: [],
  spotify: [],
});

interface MediaRowsProps {
  media: MediaResult[];
  isLoading: boolean;
  /** YouTube channels to narrow the YouTube rail by. Empty means all. */
  selectedChannels: string[];
  onChannelsChange: (channels: string[]) => void;
}

export function MediaRows({
  media,
  isLoading,
  selectedChannels,
  onChannelsChange,
}: MediaRowsProps) {
  const { t } = useTranslation();
  const [youtubeChannels, setYoutubeChannels] = useState<string[]>([]);

  useEffect(() => {
    const loadChannels = async () => {
      const channels = await getUniqueChannels();
      setYoutubeChannels(
        channels.filter((channel) => getSourceKey(channel) === "youtube"),
      );
    };

    loadChannels();
  }, []);

  const buckets = useMemo(() => {
    const grouped = emptyBuckets();
    for (const item of media) {
      grouped[getSourceKey(item.channel)].push(item);
    }
    return grouped;
  }, [media]);

  // The channel pills only narrow the YouTube rail, never the other sources.
  const youtubeItems = useMemo(() => {
    if (selectedChannels.length === 0) return buckets.youtube;
    return buckets.youtube.filter(
      (item) => item.channel && selectedChannels.includes(item.channel),
    );
  }, [buckets.youtube, selectedChannels]);

  const toggleChannel = (channel: string) => {
    onChannelsChange(
      selectedChannels.includes(channel)
        ? selectedChannels.filter((c) => c !== channel)
        : [...selectedChannels, channel],
    );
  };

  const itemsFor = (source: SourceKey) =>
    source === "youtube" ? youtubeItems : buckets[source];

  const isEverythingEmpty =
    !isLoading && SOURCE_ORDER.every((source) => itemsFor(source).length === 0);

  // Labelled so it reads as a control rather than decoration, and scrollable
  // on one line so six channels never wrap into a wall of chips on a phone.
  const channelPills = youtubeChannels.length > 0 && (
    <div className="flex items-center gap-2">
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <ListFilter className="h-4 w-4" />
        {t("filters.channel")}
      </span>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <FilterPill
          className="shrink-0"
          selected={selectedChannels.length === 0}
          onClick={() => onChannelsChange([])}
        >
          {t("rows.channelAll")}
        </FilterPill>
        {youtubeChannels.map((channel) => (
          <FilterPill
            key={channel}
            className="shrink-0"
            selected={selectedChannels.includes(channel)}
            onClick={() => toggleChannel(channel)}
          >
            {formatChannelLabel(channel)}
          </FilterPill>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {isEverythingEmpty && (
        <div className="text-center py-10 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Compass className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">{t("results.noMediaMessage")}</p>
        </div>
      )}
      {SOURCE_ORDER.map((source) => (
        <MediaRow
          key={source}
          title={t(SOURCE_LABEL_KEY[source])}
          items={itemsFor(source)}
          isLoading={isLoading}
          pills={source === "youtube" ? channelPills : undefined}
        />
      ))}
    </div>
  );
}
