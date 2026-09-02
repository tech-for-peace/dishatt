import {
  type ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clapperboard,
  Clock,
  Globe,
  type LucideIcon,
  Tv,
} from "lucide-react";

import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { getFilterOptions } from "@/lib/data";
import {
  buildSuggestions,
  formatChannelLabel,
  type SearchSuggestion,
} from "@/lib/suggestions";
import { SearchFilters, DURATION_BANDS, YEARS, Language } from "@/lib/types";
import { cn } from "@/lib/utils";

const formatDurationLabel = (label: string, language: string): string => {
  if (label.includes("hour")) {
    return language === "hi" ? "1 घंटे+" : "1 hour+";
  }

  const match = label.match(/([<>-]?\s*\d+)\s*(?:-\s*)?(\d+)?\s*(min)?/);
  if (!match) return label;

  const [, firstNum, secondNum] = match;
  const num1 = parseInt(firstNum.replace(/[<>-]/g, "").trim(), 10);
  const num2 = secondNum ? parseInt(secondNum, 10) : null;

  if (label.startsWith("<")) {
    return language === "hi" ? `${num1} मिनट से कम` : `< ${num1} min`;
  }
  if (label.includes("-")) {
    return language === "hi"
      ? `${num1} से ${num2} मिनट`
      : `${num1} to ${num2} min`;
  }
  if (label.startsWith(">")) {
    return language === "hi" ? `${num1} मिनट से अधिक` : `> ${num1} min`;
  }
  return label;
};

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (
    key: keyof SearchFilters,
    value: string | string[] | boolean,
  ) => void;
  onFiltersChange: (patch: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
}

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "h-8 shrink-0 rounded-full border px-3 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-white bg-white text-[hsl(200_55%_18%)]"
          : "border-white/30 bg-white/15 text-white hover:border-white/50 hover:bg-white/25",
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  label,
  icon: Icon,
  fill = false,
  children,
}: {
  label: string;
  icon: LucideIcon;
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("flex items-center gap-2", fill ? "min-w-0" : "shrink-0")}
      role="group"
      aria-label={label}
    >
      <span className="shrink-0 text-white/80" title={label}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div
        className={cn(
          "flex items-center gap-1.5",
          fill &&
            "min-w-0 flex-1 overflow-x-auto pb-0.5 [scrollbar-width:thin]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function toggleValue<T extends string>(current: T[], value: T): T[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

export function FilterPanel({
  filters,
  onFilterChange,
  onFiltersChange,
  onResetFilters,
}: FilterPanelProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [categories, setCategories] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      const options = await getFilterOptions();
      setCategories(options.categories);
      setChannels(options.channels);
      setTags(options.tags);
    };

    loadFilterOptions();
  }, []);

  const languageOptions = useMemo(
    (): { value: Language; label: string }[] => [
      { value: "english", label: t("language.english") },
      { value: "hindi", label: t("language.hindi") },
    ],
    [t],
  );

  const suggestions = useMemo(
    () =>
      buildSuggestions(
        deferredQuery,
        {
          channels: channels.map((channel) => ({
            value: channel,
            label: formatChannelLabel(channel),
          })),
          categories: categories.map((category) => ({
            value: category,
            label: t(`category.${category.toLowerCase()}`, category),
          })),
          languages: languageOptions,
          years: YEARS.map((year) => ({ value: year, label: year })),
          durations: DURATION_BANDS.map((band) => ({
            value: band.label,
            label: formatDurationLabel(band.label, i18n.language),
          })),
          tags,
        },
        {
          channels: filters.channels,
          categories: filters.categories,
          languages: filters.languages,
          years: filters.years,
          durationBands: filters.durationBands,
          searchTokens: filters.searchTokens ?? [],
        },
      ),
    [
      deferredQuery,
      channels,
      categories,
      tags,
      languageOptions,
      i18n.language,
      filters.channels,
      filters.categories,
      filters.languages,
      filters.years,
      filters.durationBands,
      filters.searchTokens,
      t,
    ],
  );

  const addSearchToken = (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) return;
    const currentTokens = filters.searchTokens ?? [];
    if (
      currentTokens.some((item) => item.toLowerCase() === trimmed.toLowerCase())
    ) {
      setQuery("");
      return;
    }
    const searchTokens = [...currentTokens, trimmed];
    onFiltersChange({
      searchTokens,
      titleSearch: searchTokens.join(" "),
    });
    setQuery("");
  };

  const applySuggestion = (suggestion: SearchSuggestion) => {
    switch (suggestion.kind) {
      case "channel":
        onFilterChange("channels", [...filters.channels, suggestion.value]);
        break;
      case "category":
        onFilterChange("categories", [...filters.categories, suggestion.value]);
        break;
      case "language":
        if (suggestion.value === "english" || suggestion.value === "hindi") {
          onFilterChange("languages", [...filters.languages, suggestion.value]);
        }
        break;
      case "year":
        onFilterChange("years", [...filters.years, suggestion.value]);
        break;
      case "duration":
        onFilterChange("durationBands", [
          ...filters.durationBands,
          suggestion.value,
        ]);
        break;
      case "tag":
        addSearchToken(suggestion.value);
        return;
    }
    setQuery("");
  };

  const hasActiveFilters =
    filters.languages.length > 0 ||
    filters.categories.length > 0 ||
    filters.channels.length > 0 ||
    filters.years.length > 0 ||
    filters.durationBands.length > 0 ||
    (filters.searchTokens ?? []).length > 0 ||
    filters.freeOnly;

  const searchBarTokens = useMemo(() => {
    const tokens: {
      id: string;
      label: string;
      onRemove: () => void;
    }[] = [];

    for (const token of filters.searchTokens ?? []) {
      tokens.push({
        id: `tag:${token}`,
        label: token,
        onRemove: () => {
          const searchTokens = (filters.searchTokens ?? []).filter(
            (item) => item !== token,
          );
          onFiltersChange({
            searchTokens,
            titleSearch: searchTokens.join(" "),
          });
        },
      });
    }
    for (const language of filters.languages) {
      const option = languageOptions.find((item) => item.value === language);
      tokens.push({
        id: `language:${language}`,
        label: option?.label ?? language,
        onRemove: () =>
          onFilterChange(
            "languages",
            filters.languages.filter((item) => item !== language),
          ),
      });
    }
    for (const category of filters.categories) {
      tokens.push({
        id: `category:${category}`,
        label: t(`category.${category.toLowerCase()}`, category),
        onRemove: () =>
          onFilterChange(
            "categories",
            filters.categories.filter((item) => item !== category),
          ),
      });
    }
    for (const channel of filters.channels) {
      tokens.push({
        id: `channel:${channel}`,
        label: formatChannelLabel(channel),
        onRemove: () =>
          onFilterChange(
            "channels",
            filters.channels.filter((item) => item !== channel),
          ),
      });
    }
    for (const band of filters.durationBands) {
      tokens.push({
        id: `duration:${band}`,
        label: formatDurationLabel(band, i18n.language),
        onRemove: () =>
          onFilterChange(
            "durationBands",
            filters.durationBands.filter((item) => item !== band),
          ),
      });
    }
    for (const year of filters.years) {
      tokens.push({
        id: `year:${year}`,
        label: year,
        onRemove: () =>
          onFilterChange(
            "years",
            filters.years.filter((item) => item !== year),
          ),
      });
    }
    if (filters.freeOnly) {
      tokens.push({
        id: "freeOnly",
        label: t("filters.freeOnly"),
        onRemove: () => onFilterChange("freeOnly", false),
      });
    }
    return tokens;
  }, [
    filters.searchTokens,
    filters.languages,
    filters.categories,
    filters.channels,
    filters.durationBands,
    filters.years,
    filters.freeOnly,
    languageOptions,
    i18n.language,
    onFilterChange,
    onFiltersChange,
    t,
  ]);

  return (
    <div className="bg-hero shadow-[0_8px_24px_-12px_hsl(0_0%_0%/0.45)]">
      <div className="sticky top-0 z-30 bg-hero pt-[env(safe-area-inset-top)]">
        <Header>
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            tokens={searchBarTokens}
            suggestions={suggestions}
            onSelectSuggestion={applySuggestion}
            onSubmitQuery={addSearchToken}
            onResetFilters={onResetFilters}
            canReset={hasActiveFilters}
          />
        </Header>
      </div>

      <div className="mx-auto max-w-6xl space-y-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap sm:overflow-x-auto [scrollbar-width:thin]">
          <FilterGroup label={t("filters.language")} icon={Globe}>
            {languageOptions.map((option) => (
              <FilterChip
                key={option.value}
                selected={filters.languages.includes(option.value)}
                onClick={() =>
                  onFilterChange(
                    "languages",
                    toggleValue(filters.languages, option.value),
                  )
                }
              >
                {option.label}
              </FilterChip>
            ))}
          </FilterGroup>
          <div className="max-sm:order-last max-sm:w-full">
            <FilterGroup label={t("filters.category")} icon={Clapperboard}>
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  selected={filters.categories.includes(category)}
                  onClick={() =>
                    onFilterChange(
                      "categories",
                      toggleValue(filters.categories, category),
                    )
                  }
                >
                  {t(`category.${category.toLowerCase()}`, category)}
                </FilterChip>
              ))}
            </FilterGroup>
          </div>
          <FilterChip
            selected={filters.freeOnly}
            onClick={() => onFilterChange("freeOnly", !filters.freeOnly)}
          >
            {t("filters.freeOnly")}
          </FilterChip>
        </div>

        <FilterGroup label={t("filters.duration")} icon={Clock} fill>
          {DURATION_BANDS.map((band) => (
            <FilterChip
              key={band.label}
              selected={filters.durationBands.includes(band.label)}
              onClick={() =>
                onFilterChange(
                  "durationBands",
                  toggleValue(filters.durationBands, band.label),
                )
              }
            >
              {formatDurationLabel(band.label, i18n.language)}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label={t("filters.channel")} icon={Tv} fill>
          {channels.map((channel) => (
            <FilterChip
              key={channel}
              selected={filters.channels.includes(channel)}
              onClick={() =>
                onFilterChange(
                  "channels",
                  toggleValue(filters.channels, channel),
                )
              }
            >
              {formatChannelLabel(channel)}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label={t("filters.year")} icon={Calendar} fill>
          {YEARS.map((year) => (
            <FilterChip
              key={year}
              selected={filters.years.includes(year)}
              onClick={() =>
                onFilterChange("years", toggleValue(filters.years, year))
              }
            >
              {year}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>
    </div>
  );
}
