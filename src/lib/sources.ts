export type SourceKey =
  | "timelessToday"
  | "youtube"
  | "intelligentExistence"
  | "spotify";

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

/**
 * Shorten a raw ContentSource for display on the YouTube channel pills,
 * e.g. "YouTube @PremRawatOfficial" -> "@PremRawatOfficial".
 */
export function formatChannelLabel(channel: string): string {
  return channel.replace(/^YouTube\s+/, "");
}
