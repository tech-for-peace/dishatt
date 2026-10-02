import { describe, expect, it } from "vitest";
import {
  formatChannelLabel,
  getSourceKey,
  isActiveSource,
  mediaForSource,
  SOURCE_ORDER,
  sortYoutubeChannels,
  sourceLabelKey,
  youtubeChannelLogoUrl,
} from "./sources";

describe("getSourceKey", () => {
  it("maps YouTube channels", () => {
    expect(getSourceKey("YouTube @PremRawatOfficial")).toBe("youtube");
  });

  it("maps Spotify channels", () => {
    expect(getSourceKey("Spotify Prem Rawat")).toBe("spotify");
  });

  it("maps Intelligent Existence channels", () => {
    expect(getSourceKey("Intelligent Existence")).toBe("intelligentExistence");
  });

  it("maps Apple Podcast channels", () => {
    expect(getSourceKey("Apple Podcast")).toBe("applePodcast");
  });

  it("defaults to Timeless Today", () => {
    expect(getSourceKey("Timeless Today")).toBe("timelessToday");
    expect(getSourceKey(undefined)).toBe("timelessToday");
    expect(getSourceKey("")).toBe("timelessToday");
  });
});

describe("formatChannelLabel", () => {
  it("strips the YouTube prefix", () => {
    expect(formatChannelLabel("YouTube @PremRawatOfficial")).toBe("@PremRawatOfficial");
  });

  it("leaves non-YouTube labels unchanged", () => {
    expect(formatChannelLabel("Spotify Prem Rawat")).toBe("Spotify Prem Rawat");
  });
});

describe("youtubeChannelLogoUrl", () => {
  it("builds an unavatar URL for @handles", () => {
    expect(youtubeChannelLogoUrl("YouTube @PremRawatOfficial")).toBe(
      "https://unavatar.io/youtube/@PremRawatOfficial",
    );
  });

  it("returns undefined without a handle", () => {
    expect(youtubeChannelLogoUrl("YouTube (Other)")).toBeUndefined();
  });
});

describe("sortYoutubeChannels", () => {
  it("orders known channels for compact mobile wrapping", () => {
    expect(
      sortYoutubeChannels([
        "YouTube @rajvidyakender",
        "YouTube (Other)",
        "YouTube @PremRawatOfficial",
        "YouTube @TimelessToday",
        "YouTube @wopgyt",
      ]),
    ).toEqual([
      "YouTube @PremRawatOfficial",
      "YouTube @wopgyt",
      "YouTube (Other)",
      "YouTube @TimelessToday",
      "YouTube @rajvidyakender",
    ]);
  });

  it("appends unknown channels alphabetically", () => {
    expect(sortYoutubeChannels(["YouTube @zzz", "YouTube @wopgyt", "YouTube @aaa"])).toEqual([
      "YouTube @wopgyt",
      "YouTube @aaa",
      "YouTube @zzz",
    ]);
  });
});

describe("SOURCE_ORDER", () => {
  it("lists each source once", () => {
    expect(SOURCE_ORDER).toEqual([
      "timelessToday",
      "youtube",
      "intelligentExistence",
      "spotify",
      "applePodcast",
    ]);
    expect(new Set(SOURCE_ORDER).size).toBe(SOURCE_ORDER.length);
  });
});

describe("isActiveSource", () => {
  it("accepts every source and all", () => {
    expect(isActiveSource("all")).toBe(true);
    for (const source of SOURCE_ORDER) {
      expect(isActiveSource(source)).toBe(true);
    }
  });

  it("rejects unknown values", () => {
    expect(isActiveSource("tiktok")).toBe(false);
    expect(isActiveSource(null)).toBe(false);
  });
});

describe("sourceLabelKey", () => {
  it("maps all and platform sources to i18n keys", () => {
    expect(sourceLabelKey("all")).toBe("sources.all");
    expect(sourceLabelKey("youtube")).toBe("mediaCard.youtube");
  });
});

describe("mediaForSource", () => {
  const items = [
    { id: "1", channel: "YouTube @Foo" },
    { id: "2", channel: "Spotify" },
    { id: "3", channel: "Timeless Today" },
  ];

  it("returns all items for all", () => {
    expect(mediaForSource(items, "all")).toHaveLength(3);
  });

  it("filters by platform", () => {
    expect(mediaForSource(items, "youtube").map((i) => i.id)).toEqual(["1"]);
    expect(mediaForSource(items, "spotify").map((i) => i.id)).toEqual(["2"]);
    expect(mediaForSource(items, "timelessToday").map((i) => i.id)).toEqual(["3"]);
  });
});
