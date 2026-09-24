/** Canonical source order; `SourceKey` is derived from this list. */
export const SOURCE_ORDER = [
  "timelessToday",
  "youtube",
  "intelligentExistence",
  "spotify",
  "applePodcast",
] as const;

export type SourceKey = (typeof SOURCE_ORDER)[number];

export function getSourceKey(channel?: string): SourceKey {
  if (channel?.includes("YouTube")) return "youtube";
  if (channel?.includes("Spotify")) return "spotify";
  if (channel?.includes("Intelligent Existence")) return "intelligentExistence";
  // Cache uses ContentSource "Podcast" for Apple Podcasts episodes.
  if (channel?.includes("Podcast")) return "applePodcast";
  return "timelessToday";
}

export const SOURCE_LABEL_KEY: Record<SourceKey, string> = Object.fromEntries(
  SOURCE_ORDER.map((key) => [key, `mediaCard.${key}`]),
) as Record<SourceKey, string>;

/** Strip the "YouTube " prefix for display, e.g. "YouTube @Foo" -> "@Foo". */
export function formatChannelLabel(channel: string): string {
  return channel.replace(/^YouTube\s+/, "");
}

/** Channel avatar for `YouTube @handle` rows; undefined for unlabeled channels. */
export function youtubeChannelLogoUrl(channel: string): string | undefined {
  const handle = channel.match(/^YouTube @(.+)$/)?.[1];
  if (!handle) return undefined;
  return `https://unavatar.io/youtube/@${encodeURIComponent(handle)}`;
}
