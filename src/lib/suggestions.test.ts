import { describe, expect, it } from "vitest";
import {
  buildSuggestions,
  formatChannelLabel,
  scoreTextMatch,
  type ActiveSuggestionFilters,
  type SuggestionSources,
} from "./suggestions";

const emptyActive: ActiveSuggestionFilters = {
  channels: [],
  categories: [],
  languages: [],
  years: [],
  durationBands: [],
  searchTokens: [],
};

const sources: SuggestionSources = {
  channels: [
    { value: "YouTube @PremRawatOfficial", label: "@PremRawatOfficial" },
    { value: "YouTube @TimelessToday", label: "@TimelessToday" },
    { value: "Timeless Today", label: "Timeless Today" },
  ],
  categories: [
    { value: "Video", label: "Video" },
    { value: "Music", label: "Music" },
    { value: "Podcast", label: "Podcast" },
  ],
  languages: [
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
  ],
  years: [
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ],
  durations: [{ value: "> 1 hour", label: "Over 1 hour" }],
  tags: ["prem rawat", "peace", "inner peace", "hear yourself"],
};

describe("formatChannelLabel", () => {
  it("extracts a YouTube handle", () => {
    expect(formatChannelLabel("YouTube @PremRawatOfficial")).toBe(
      "@PremRawatOfficial",
    );
  });

  it("keeps names without a handle", () => {
    expect(formatChannelLabel("Timeless Today")).toBe("Timeless Today");
  });
});

describe("scoreTextMatch", () => {
  it("matches a handle prefix without spaces or symbols", () => {
    expect(scoreTextMatch("PremRawa", "@PremRawatOfficial")).toBeGreaterThan(0);
  });
});

describe("buildSuggestions", () => {
  it("puts the matching channel handle at the top for PremRawa", () => {
    const suggestions = buildSuggestions("PremRawa", sources, emptyActive);

    expect(suggestions[0]).toEqual({
      kind: "channel",
      value: "YouTube @PremRawatOfficial",
      label: "@PremRawatOfficial",
    });
    expect(suggestions.some((item) => item.kind === "tag")).toBe(true);
  });

  it("suggests years, languages, and categories", () => {
    expect(buildSuggestions("2024", sources, emptyActive)[0]?.value).toBe(
      "2024",
    );
    expect(buildSuggestions("hindi", sources, emptyActive)[0]?.kind).toBe(
      "language",
    );
    expect(buildSuggestions("music", sources, emptyActive)[0]?.value).toBe(
      "Music",
    );
  });

  it("omits filters that are already active", () => {
    const suggestions = buildSuggestions("PremRawa", sources, {
      ...emptyActive,
      channels: ["YouTube @PremRawatOfficial"],
    });

    expect(
      suggestions.some((item) => item.value === "YouTube @PremRawatOfficial"),
    ).toBe(false);
  });

  it("returns nothing for an empty query", () => {
    expect(buildSuggestions("   ", sources, emptyActive)).toEqual([]);
  });
});
