import { describe, expect, it } from "vitest";
import { filterMedia } from "@/lib/data";
import type { MediaResult, SearchFilters } from "@/lib/types";

const emptyFilters: SearchFilters = {
  language: "",
  categories: [],
  channels: [],
  durationBands: [],
  years: [],
  titleSearch: "",
  freeOnly: false,
};

function media(partial: Partial<MediaResult> & Pick<MediaResult, "id" | "title">): MediaResult {
  return {
    description: "",
    thumbnail: "",
    duration: 10,
    publishedYear: 2024,
    language: "en",
    url: "#",
    tags: [],
    ...partial,
  };
}

describe("filterMedia tags-only titleSearch", () => {
  const catalog = [
    media({
      id: "1",
      title: "Should Not Match By Title Alone",
      description: "tanav is only in description",
      tags: ["delhi", "दिल्ली", "dilli"],
    }),
    media({
      id: "2",
      title: "Tanav Talk",
      description: "about stress",
      tags: ["tanav", "तनाव", "peace education program", "शांति शिक्षा कार्यक्रम", "shanti shiksha karyakram"],
    }),
    media({
      id: "3",
      title: "Untagged",
      description: "no tags field useful",
      tags: undefined,
    }),
  ];

  it("matches English tag", () => {
    const got = filterMedia(catalog, { ...emptyFilters, titleSearch: "delhi" });
    expect(got.map((m) => m.id)).toEqual(["1"]);
  });

  it("matches Hindi Devanagari tag", () => {
    const got = filterMedia(catalog, { ...emptyFilters, titleSearch: "तनाव" });
    expect(got.map((m) => m.id)).toEqual(["2"]);
  });

  it("matches Hinglish tag", () => {
    const got = filterMedia(catalog, {
      ...emptyFilters,
      titleSearch: "shanti shiksha",
    });
    expect(got.map((m) => m.id)).toEqual(["2"]);
  });

  it("does not match title or description when tags lack the term", () => {
    const got = filterMedia(catalog, { ...emptyFilters, titleSearch: "stress" });
    expect(got).toEqual([]);
  });

  it("requires all search words (AND)", () => {
    const got = filterMedia(catalog, {
      ...emptyFilters,
      titleSearch: "tanav delhi",
    });
    expect(got).toEqual([]);
  });

  it("matches a partial tag word", () => {
    const got = filterMedia(catalog, {
      ...emptyFilters,
      titleSearch: "education",
    });
    expect(got.map((m) => m.id)).toEqual(["2"]);
  });

  it("matches a longer query against a shorter tag stem", () => {
    const catalogWithBeej = [
      media({
        id: "4",
        title: "Seeds",
        tags: ["seeds of peace", "शांति के बीज", "shanti ke beej"],
      }),
    ];
    const matched = filterMedia(catalogWithBeej, {
      ...emptyFilters,
      titleSearch: "beejon",
    });
    expect(matched.map((m) => m.id)).toEqual(["4"]);
  });

  it("matches close spellings of a tag word", () => {
    const got = filterMedia(
      [media({ id: "1", title: "Delhi only", tags: ["delhi", "दिल्ली"] })],
      { ...emptyFilters, titleSearch: "delhy" },
    );
    expect(got.map((m) => m.id)).toEqual(["1"]);

    const jayanti = filterMedia(
      [
        media({
          id: "5",
          title: "Hans Jayanti",
          tags: ["hans jayanti", "हंस जयंती"],
        }),
      ],
      { ...emptyFilters, titleSearch: "jayantu" },
    );
    expect(jayanti.map((m) => m.id)).toEqual(["5"]);
  });

  it("does not reverse-match a short tag inside a longer query", () => {
    const catalogWithWar = [
      media({ id: "6", title: "WHY WAR?", tags: ["war"] }),
      media({
        id: "7",
        title: "Why war in a phrase",
        tags: ["why war"],
      }),
    ];
    const got = filterMedia(catalogWithWar, {
      ...emptyFilters,
      titleSearch: "forward",
    });
    expect(got).toEqual([]);
  });

  it("does not fuzzy-match unrelated 5-letter words", () => {
    const got = filterMedia(
      [media({ id: "8", title: "Peace talk", tags: ["peace"] })],
      { ...emptyFilters, titleSearch: "teach" },
    );
    expect(got).toEqual([]);
  });
});
