import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

import { FilterMenu } from "@/components/ui/filter-menu";
import { Input } from "@/components/ui/input";
import { YoutubeIcon } from "@/components/icons/source-icons";
import { formatChannelLabel, youtubeChannelLogoUrl } from "@/lib/sources";
import { FilterFacets, Language, SearchFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

const formatDurationLabel = (label: string, language: string): string => {
  if (label.includes("hour")) {
    const num = parseInt(label.match(/\d+/)?.[0] || "1", 10);
    return language === "hi" ? `${num} घंटे से अधिक` : label;
  }

  const match = label.match(/([<>-]?\s*\d+)\s*(?:-\s*)?(\d+)?\s*(min)?/);
  if (!match) return label;

  const [, firstNum, secondNum] = match;
  const num1 = parseInt(firstNum.replace(/[<>-]/g, "").trim(), 10);
  const num2 = secondNum ? parseInt(secondNum, 10) : null;

  if (language === "hi") {
    if (label.startsWith("<")) return `${num1} मिनट से कम`;
    if (label.includes("-")) return `${num1}-${num2} मिनट`;
    if (label.startsWith(">")) return `${num1} मिनट से अधिक`;
  }

  return label;
};

interface FilterBarProps {
  filters: SearchFilters;
  facets: FilterFacets;
  onFilterChange: (key: keyof SearchFilters, value: string | string[] | boolean) => void;
  onResetFilters: () => void;
}

export function FilterBar({ filters, facets, onFilterChange, onResetFilters }: FilterBarProps) {
  const { t, i18n } = useTranslation();

  // Show language even when only one option (e.g. Spotify / Apple → English).
  const showLanguage = facets.languages.length >= 1;
  const showDurations = facets.durationBands.length > 0;
  const showYears = facets.years.length > 0;
  const showFreeOnly = facets.hasLoginRequired;
  const showChannels = facets.channels.length > 0;

  const languageOptions = facets.languages.map((value) => ({
    value,
    label: t(`language.${value}`),
  }));

  const durationOptions = facets.durationBands.map((band) => ({
    value: band,
    label: formatDurationLabel(band, i18n.language),
  }));

  const yearOptions = facets.years.map((year) => ({ value: year, label: year }));

  const dropdownCount = Number(showLanguage) + Number(showDurations) + Number(showYears);
  // Phone uses 2 filter columns; an odd count leaves the last menu alone — span it full width.
  const phoneLastMenuSpans = dropdownCount % 2 === 1;
  const lastMenu = showYears
    ? "years"
    : showDurations
      ? "durations"
      : showLanguage
        ? "language"
        : null;

  const selectChannel = (channel: string) => {
    const next = filters.channels[0] === channel ? [] : [channel];
    onFilterChange("channels", next);
  };

  const menuSpanClass = (menu: "language" | "durations" | "years") =>
    phoneLastMenuSpans && lastMenu === menu ? "col-span-2 sm:col-span-1" : undefined;

  const freeCheckbox = showFreeOnly ? (
    <label className="flex h-9 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-none border border-border/60 px-2.5 py-1 text-base font-medium text-foreground/80 transition-colors hover:border-border hover:text-foreground sm:gap-2 sm:px-3">
      <input
        type="checkbox"
        checked={filters.freeOnly}
        onChange={(e) => onFilterChange("freeOnly", e.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-border accent-primary"
      />
      <span>{t("filters.freeOnly")}</span>
    </label>
  ) : null;

  const resetButton = (
    <button
      type="button"
      onClick={onResetFilters}
      aria-label={t("filters.reset")}
      title={t("filters.reset")}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-border/60 text-foreground/70 transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
    >
      <RefreshCw className="h-4 w-4" />
    </button>
  );

  return (
    <div className="relative z-20 -mt-8">
      <div className="w-full animate-fade-in rounded-none border border-border/50 bg-card/80 p-2.5 shadow-soft backdrop-blur-sm space-y-1.5">
        {dropdownCount > 0 && (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {showLanguage && (
              <FilterMenu
                label={t("filters.allLanguages")}
                mode="single"
                value={filters.language}
                options={languageOptions}
                onChange={(value) => onFilterChange("language", value as Language)}
                className={menuSpanClass("language")}
              />
            )}
            {showDurations && (
              <FilterMenu
                label={t("filters.allDurations")}
                mode="multi"
                values={filters.durationBands || []}
                options={durationOptions}
                onChange={(values) => onFilterChange("durationBands", values)}
                className={menuSpanClass("durations")}
              />
            )}
            {showYears && (
              <FilterMenu
                label={t("filters.allYears")}
                mode="multi"
                values={filters.years || []}
                options={yearOptions}
                onChange={(values) => onFilterChange("years", values)}
                className={menuSpanClass("years")}
              />
            )}
          </div>
        )}

        <div className="flex gap-1.5">
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={filters.titleSearch}
            onChange={(e) => onFilterChange("titleSearch", e.target.value)}
            className="h-9 min-w-0 flex-1 rounded-none border-border/50 bg-background/50 text-base transition-colors hover:border-primary/30"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <div className="flex gap-1.5">
            {freeCheckbox}
            {resetButton}
          </div>
        </div>

        {showChannels && (
          <div className="flex flex-wrap items-center gap-1">
            {facets.channels.map((channel) => {
              const selected = filters.channels[0] === channel;
              const logoUrl = youtubeChannelLogoUrl(channel);
              return (
                <button
                  key={channel}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectChannel(channel)}
                  className={cn(
                    "inline-flex h-7 cursor-pointer items-center gap-1 rounded-none border px-1.5 text-xs font-medium shadow-sm transition-all active:translate-y-px",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground/80 opacity-75 hover:opacity-100",
                  )}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5 shrink-0 rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <YoutubeIcon className="h-3 w-3 shrink-0" />
                  )}
                  {formatChannelLabel(channel)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
