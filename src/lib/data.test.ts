import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  filterMedia,
  getFacets,
  recordMediaClick,
  sanitizeFiltersAgainstFacets,
  sortMedia,
} from "@/lib/data";
import type { FilterFacets, MediaResult, SearchFilters } from "@/lib/types";

const { apiUrlState } = vi.hoisted(() => ({
  apiUrlState: { value: "" as string },
}));

vi.mock("@/lib/constants", () => ({
  API_CONFIG: {
    cachePath: "/data/cache.json",
    get apiUrl() {
      return apiUrlState.value;
    },
  },
}));

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
      tags: ["delhi", "दिल्ली", "dilli"],
    }),
    media({
      id: "2",
      title: "Tanav Talk",
      tags: [
        "tanav",
        "तनाव",
        "peace education program",
        "शांति शिक्षा कार्यक्रम",
        "shanti shiksha karyakram",
      ],
    }),
    media({
      id: "3",
      title: "Untagged",
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

  it("does not match title when tags lack the term", () => {
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
    const got = filterMedia([media({ id: "1", title: "Delhi only", tags: ["delhi", "दिल्ली"] })], {
      ...emptyFilters,
      titleSearch: "delhy",
    });
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
    const got = filterMedia([media({ id: "8", title: "Peace talk", tags: ["peace"] })], {
      ...emptyFilters,
      titleSearch: "teach",
    });
    expect(got).toEqual([]);
  });
});

describe("getFacets", () => {
  const catalog = [
    media({
      id: "tt1",
      title: "TT Hindi Video",
      channel: "Timeless Today",
      language: "hi",
      category: "Video",
      publishedYear: 2023,
      duration: 5,
      loginRequired: true,
    }),
    media({
      id: "tt2",
      title: "TT English Music",
      channel: "Timeless Today",
      language: "en",
      category: "Music",
      publishedYear: 2021,
      duration: 70,
      loginRequired: false,
    }),
    media({
      id: "yt1",
      title: "YT Official",
      channel: "YouTube @PremRawatOfficial",
      language: "en",
      category: "Video",
      publishedYear: 2024,
      duration: 15,
    }),
    media({
      id: "yt2",
      title: "YT WOPG",
      channel: "YouTube @wopgyt",
      language: "hi",
      category: "Video",
      publishedYear: 2022,
      duration: 45,
    }),
    media({
      id: "sp1",
      title: "Spotify episode",
      channel: "Spotify",
      language: "en",
      category: "Podcast",
      publishedYear: 2020,
      duration: 30,
    }),
  ];

  it("scopes options to YouTube and exposes channels", () => {
    const facets = getFacets(catalog, "youtube");
    expect(facets.channels).toEqual(["YouTube @PremRawatOfficial", "YouTube @wopgyt"]);
    expect(facets.categories).toEqual(["Video"]);
    expect(facets.languages).toEqual(["english", "hindi"]);
    expect(facets.years).toEqual(["2024", "2022"]);
    expect(facets.durationBands).toEqual(["10-20 min", "40-60 min"]);
    expect(facets.hasLoginRequired).toBe(false);
  });

  it("only lists YouTube channels that have items in the chosen category", () => {
    const withMusic = [
      ...catalog,
      media({
        id: "yt3",
        title: "YT Music",
        channel: "YouTube @rajvidyakender",
        language: "en",
        category: "Music",
        publishedYear: 2023,
        duration: 5,
      }),
    ];
    expect(getFacets(withMusic, "youtube", ["Music"]).channels).toEqual([
      "YouTube @rajvidyakender",
    ]);
    expect(getFacets(withMusic, "youtube", ["Video"]).channels).toEqual([
      "YouTube @PremRawatOfficial",
      "YouTube @wopgyt",
    ]);
  });

  it("does not expose channels for Spotify", () => {
    const facets = getFacets(catalog, "spotify");
    expect(facets.channels).toEqual([]);
    expect(facets.categories).toEqual(["Podcast"]);
    expect(facets.languages).toEqual(["english"]);
    expect(facets.years).toEqual(["2020"]);
    expect(facets.durationBands).toEqual(["20-40 min"]);
    expect(facets.hasLoginRequired).toBe(false);
  });

  it("marks hasLoginRequired for Timeless Today", () => {
    const facets = getFacets(catalog, "timelessToday");
    expect(facets.hasLoginRequired).toBe(true);
    expect(facets.languages).toEqual(["english", "hindi"]);
    expect(facets.categories).toEqual(["Music", "Video"]);
    expect(facets.years).toEqual(["2023", "2021"]);
    expect(facets.durationBands).toEqual(["< 10 min", "> 1 hour"]);
    expect(facets.channels).toEqual([]);
  });

  it("unions facets for All", () => {
    const facets = getFacets(catalog, "all");
    expect(facets.channels).toEqual([]);
    expect(facets.languages).toEqual(["english", "hindi"]);
    expect(facets.categories).toEqual(["Music", "Podcast", "Video"]);
    expect(facets.years).toEqual(["2024", "2023", "2022", "2021", "2020"]);
    expect(facets.hasLoginRequired).toBe(true);
    expect(facets.durationBands).toEqual([
      "< 10 min",
      "10-20 min",
      "20-40 min",
      "40-60 min",
      "> 1 hour",
    ]);
  });
});

describe("sortMedia", () => {
  const items = [
    media({ id: "a", title: "A", timestamp: 3 }),
    media({ id: "b", title: "B", timestamp: 2 }),
    media({ id: "c", title: "C", timestamp: 1 }),
  ];

  it("keeps the newest-first catalog order", () => {
    expect(sortMedia(items, "newest").map((m) => m.id)).toEqual(["a", "b", "c"]);
  });

  it("reverses for oldest first without mutating the input", () => {
    expect(sortMedia(items, "oldest").map((m) => m.id)).toEqual(["c", "b", "a"]);
    expect(items.map((m) => m.id)).toEqual(["a", "b", "c"]);
  });
});

describe("sanitizeFiltersAgainstFacets", () => {
  const facets: FilterFacets = {
    languages: ["english"],
    categories: ["Podcast"],
    channels: [],
    years: ["2020"],
    durationBands: ["20-40 min"],
    hasLoginRequired: false,
  };

  it("drops invalid values and clears freeOnly when unavailable", () => {
    const dirty: SearchFilters = {
      language: "hindi",
      categories: ["Video", "Podcast"],
      channels: ["YouTube @PremRawatOfficial"],
      years: ["2024", "2020"],
      durationBands: ["< 10 min", "20-40 min"],
      titleSearch: "peace",
      freeOnly: true,
    };
    expect(sanitizeFiltersAgainstFacets(dirty, facets)).toEqual({
      language: "english",
      categories: ["Podcast"],
      channels: [],
      years: ["2020"],
      durationBands: ["20-40 min"],
      titleSearch: "peace",
      freeOnly: false,
    });
  });

  it("defaults to the sole available language", () => {
    expect(sanitizeFiltersAgainstFacets({ ...emptyFilters, language: "" }, facets).language).toBe(
      "english",
    );
  });

  it("keeps a single valid YouTube channel", () => {
    const ytFacets: FilterFacets = {
      ...facets,
      languages: ["english", "hindi"],
      categories: ["Video"],
      channels: ["YouTube @PremRawatOfficial", "YouTube @wopgyt"],
      years: ["2024"],
      durationBands: ["10-20 min"],
    };
    const result = sanitizeFiltersAgainstFacets(
      {
        ...emptyFilters,
        language: "english",
        channels: ["YouTube @wopgyt", "YouTube @PremRawatOfficial"],
      },
      ytFacets,
    );
    expect(result.channels).toEqual(["YouTube @wopgyt"]);
    expect(result.language).toBe("english");
  });
});

describe("recordMediaClick", () => {
  const visitorId = "550e8400-e29b-41d4-a716-446655440000";
  const mediaId = "yt-abc123";
  let store: Map<string, string>;
  let sendBeacon: ReturnType<typeof vi.fn>;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = new Map();
    apiUrlState.value = "https://clicks.example";
    sendBeacon = vi.fn(() => true);
    fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    });
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("crypto", {
      randomUUID: () => visitorId,
    });
    vi.stubGlobal("navigator", { sendBeacon });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal(
      "Blob",
      class MockBlob {
        constructor(
          public parts: BlobPart[],
          public options?: BlobPropertyBag,
        ) {}
      },
    );

    store.set("dishatt_visitor_id", visitorId);
  });

  afterEach(() => {
    apiUrlState.value = "";
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends a beacon when sendBeacon succeeds", () => {
    recordMediaClick(mediaId);

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(sendBeacon.mock.calls[0][0]).toBe("https://clicks.example/api/clicks");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to fetch when sendBeacon returns false", () => {
    sendBeacon.mockReturnValue(false);

    recordMediaClick(mediaId);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("https://clicks.example/api/clicks");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      keepalive: true,
      mode: "cors",
    });
  });

  it("does nothing when apiUrl is empty", () => {
    apiUrlState.value = "";

    recordMediaClick(mediaId);

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does nothing for an invalid media id", () => {
    recordMediaClick("bad id!");

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not throw when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
      clear: () => {
        throw new Error("blocked");
      },
    });

    expect(() => recordMediaClick(mediaId)).not.toThrow();
    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
