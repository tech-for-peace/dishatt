/** Canonical source order; `SourceKey` is derived from this list. */
export const SOURCE_ORDER = [
  "timelessToday",
  "youtube",
  "intelligentExistence",
  "spotify",
  "applePodcast",
] as const;

export type SourceKey = (typeof SOURCE_ORDER)[number];

/** Source picker / URL value: a concrete platform or "all". */
export type ActiveSource = SourceKey | "all";

const ACTIVE_SOURCE_SET = new Set<string>(["all", ...SOURCE_ORDER]);

export function isActiveSource(value: string | null | undefined): value is ActiveSource {
  return typeof value === "string" && ACTIVE_SOURCE_SET.has(value);
}

export function getSourceKey(channel?: string): SourceKey {
  if (channel?.includes("YouTube")) return "youtube";
  if (channel?.includes("Spotify")) return "spotify";
  if (channel?.includes("Intelligent Existence")) return "intelligentExistence";
  if (channel?.includes("Apple Podcast")) return "applePodcast";
  return "timelessToday";
}

/** Items belonging to a picker source (all items when source is "all"). */
export function mediaForSource<T extends { channel?: string }>(
  media: T[],
  source: ActiveSource,
): T[] {
  if (source === "all") return media;
  return media.filter((item) => getSourceKey(item.channel) === source);
}

/** i18n key for a source's display name. */
export function sourceLabelKey(source: ActiveSource): string {
  return source === "all" ? "sources.all" : `mediaCard.${source}`;
}

/** Strip the "YouTube " prefix for display, e.g. "YouTube @Foo" -> "@Foo". */
export function formatChannelLabel(channel: string): string {
  return channel.replace(/^YouTube\s+/, "");
}

/**
 * Preferred YouTube channel order for the filter chips.
 * Short handles after the longest so three fit on row 1 on typical phones (→ 2 rows).
 * Unknown channels append alphabetically.
 */
const YOUTUBE_CHANNEL_ORDER = [
  "YouTube @PremRawatOfficial",
  "YouTube @wopgyt",
  "YouTube (Other)",
  "YouTube @TimelessToday",
  "YouTube @rajvidyakender",
] as const;

export function sortYoutubeChannels(channels: string[]): string[] {
  const rank = new Map<string, number>(
    YOUTUBE_CHANNEL_ORDER.map((channel, index) => [channel, index]),
  );
  return [...channels].sort((a, b) => {
    const aRank = rank.get(a);
    const bRank = rank.get(b);
    if (aRank !== undefined && bRank !== undefined) return aRank - bRank;
    if (aRank !== undefined) return -1;
    if (bRank !== undefined) return 1;
    return a.localeCompare(b);
  });
}

/** Channel avatar for `YouTube @handle` rows; undefined for unlabeled channels. */
export function youtubeChannelLogoUrl(channel: string): string | undefined {
  const handle = channel.match(/^YouTube @(.+)$/)?.[1];
  if (!handle) return undefined;
  return `https://unavatar.io/youtube/@${encodeURIComponent(handle)}`;
}
