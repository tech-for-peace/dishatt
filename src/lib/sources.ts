export type SourceKey = "timelessToday" | "youtube" | "intelligentExistence" | "spotify";

export function getSourceKey(channel?: string): SourceKey {
  if (channel?.includes("YouTube")) return "youtube";
  if (channel?.includes("Spotify")) return "spotify";
  if (channel?.includes("Intelligent Existence")) return "intelligentExistence";
  return "timelessToday";
}

export const SOURCE_ORDER: SourceKey[] = [
  "timelessToday",
  "youtube",
  "intelligentExistence",
  "spotify",
];

export const SOURCE_LABEL_KEY: Record<SourceKey, string> = {
  timelessToday: "mediaCard.timelessToday",
  youtube: "mediaCard.youtube",
  intelligentExistence: "mediaCard.intelligentExistence",
  spotify: "mediaCard.spotify",
};

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
