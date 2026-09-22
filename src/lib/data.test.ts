import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { filterMedia, recordMediaClick } from "@/lib/data";
import type { MediaResult, SearchFilters } from "@/lib/types";

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
