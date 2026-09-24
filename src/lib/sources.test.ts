import { describe, expect, it } from "vitest";
import { formatChannelLabel, getSourceKey, SOURCE_ORDER, youtubeChannelLogoUrl } from "./sources";

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
    expect(getSourceKey("Podcast")).toBe("applePodcast");
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
