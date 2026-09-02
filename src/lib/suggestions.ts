export type SuggestionKind =
  "channel" | "tag" | "year" | "category" | "language" | "duration";

export interface SearchSuggestion {
  kind: SuggestionKind;
  value: string;
  label: string;
}

export interface SuggestionOption {
  value: string;
  label: string;
}

export interface SuggestionSources {
  channels: SuggestionOption[];
  categories: SuggestionOption[];
  languages: SuggestionOption[];
  years: SuggestionOption[];
  durations: SuggestionOption[];
  tags: string[];
}

export interface ActiveSuggestionFilters {
  channels: string[];
  categories: string[];
  languages: string[];
  years: string[];
  durationBands: string[];
  searchTokens: string[];
}

const KIND_BOOST: Record<SuggestionKind, number> = {
  channel: 18,
  language: 12,
  category: 12,
  duration: 10,
  year: 10,
  tag: 0,
};

const KIND_RANK: Record<SuggestionKind, number> = {
  channel: 0,
  language: 1,
  category: 2,
  duration: 3,
  year: 4,
  tag: 5,
};

type RankedSuggestion = { suggestion: SearchSuggestion; score: number };

export function formatChannelLabel(channel: string): string {
  const match = channel.match(/@[A-Za-z0-9._]+/);
  return match ? match[0] : channel;
}

function compactText(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function hasSeparators(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 48) return true;
    if (code > 57 && code < 97) return true;
    if (code > 122 && code < 128) return true;
  }
  return false;
}

export function scoreTextMatch(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 86;
  if (t.includes(q)) return 64;

  if (!hasSeparators(q) && !hasSeparators(t)) return 0;

  const compactQuery = compactText(q);
  const compactTarget = compactText(t);
  if (!compactQuery || !compactTarget) return 0;
  if (compactTarget === compactQuery) return 96;
  if (compactTarget.startsWith(compactQuery)) return 80;
  if (compactTarget.includes(compactQuery)) return 56;
  return 0;
}

function optionScore(query: string, option: SuggestionOption): number {
  return Math.max(
    scoreTextMatch(query, option.label),
    scoreTextMatch(query, option.value),
  );
}

function compareRanked(a: RankedSuggestion, b: RankedSuggestion): number {
  if (b.score !== a.score) return b.score - a.score;
  const kindDiff = KIND_RANK[a.suggestion.kind] - KIND_RANK[b.suggestion.kind];
  if (kindDiff !== 0) return kindDiff;
  return a.suggestion.label.localeCompare(b.suggestion.label);
}

function insertTop(
  ranked: RankedSuggestion[],
  item: RankedSuggestion,
  limit: number,
): void {
  const itemKey = `${item.suggestion.kind}:${item.suggestion.value.toLowerCase()}`;
  const existing = ranked.findIndex(
    (row) =>
      `${row.suggestion.kind}:${row.suggestion.value.toLowerCase()}` ===
      itemKey,
  );
  if (existing >= 0) {
    if (compareRanked(item, ranked[existing]) < 0) {
      ranked[existing] = item;
      ranked.sort(compareRanked);
    }
    return;
  }
  if (ranked.length < limit) {
    ranked.push(item);
    ranked.sort(compareRanked);
    return;
  }
  if (compareRanked(item, ranked[ranked.length - 1]) >= 0) return;
  ranked[ranked.length - 1] = item;
  ranked.sort(compareRanked);
}

export function buildSuggestions(
  query: string,
  sources: SuggestionSources,
  active: ActiveSuggestionFilters,
  limit = 8,
): SearchSuggestion[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const ranked: RankedSuggestion[] = [];

  const consider = (
    kind: SuggestionKind,
    option: SuggestionOption,
    alreadyActive: boolean,
  ) => {
    if (alreadyActive) return;
    const base = optionScore(trimmed, option);
    if (base <= 0) return;
    insertTop(
      ranked,
      {
        suggestion: { kind, value: option.value, label: option.label },
        score: base + KIND_BOOST[kind],
      },
      limit,
    );
  };

  for (const channel of sources.channels) {
    consider("channel", channel, active.channels.includes(channel.value));
  }
  for (const category of sources.categories) {
    consider("category", category, active.categories.includes(category.value));
  }
  for (const language of sources.languages) {
    consider("language", language, active.languages.includes(language.value));
  }
  for (const year of sources.years) {
    consider("year", year, active.years.includes(year.value));
  }
  for (const duration of sources.durations) {
    consider(
      "duration",
      duration,
      active.durationBands.includes(duration.value),
    );
  }

  const usedTags = new Set(
    active.searchTokens.map((token) => token.toLowerCase()),
  );
  for (const tag of sources.tags) {
    if (usedTags.has(tag.toLowerCase())) continue;
    const base = scoreTextMatch(trimmed, tag);
    if (base <= 0) continue;
    insertTop(
      ranked,
      {
        suggestion: { kind: "tag", value: tag, label: tag },
        score: base,
      },
      limit,
    );
  }

  return ranked.map((row) => row.suggestion);
}
