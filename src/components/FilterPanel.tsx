import { useTranslation } from "react-i18next";
import { RefreshCw, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterPill } from "@/components/ui/filter-pill";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { SearchFilters, DURATION_BANDS, YEARS, Language } from "@/lib/types";
import { useState, useEffect } from "react";
import { getUniqueCategories } from "@/lib/data";
import { HIDDEN_CATEGORIES } from "@/lib/constants";
const formatDurationLabel = (label: string, language: string): string => {
  if (label === "Any Duration") return label;

  // Handle 'hour' in the label
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
    if (label.startsWith("<")) {
      return `${num1} मिनट से कम`;
    } else if (label.includes("-")) {
      return `${num1}-${num2} मिनट`;
    } else if (label.startsWith(">")) {
      return `${num1} मिनट से अधिक`;
    }
  }

  return label; // Return original for English or if no match
};

const DROPDOWN_TRIGGER_CLASS =
  "flex h-8 w-full lg:w-44 items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground hover:border-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/** One width for every filter pill, so no group's pills look bigger than
 *  another's. Wide enough for the longest label ("English") at text-sm. */
const PILL_CLASS = "w-24 sm:w-28";

/** Divider between filter groups. Deliberately stronger than `border` so the
 *  grouping reads at a glance against the translucent filter card. */
function FilterSeparator({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`h-7 w-px shrink-0 self-center bg-foreground/25 ${className}`}
    />
  );
}

// No "All" pill: clicking the active language clears it back to all.
const LANGUAGE_OPTIONS: { value: Language; labelKey: string }[] = [
  { value: "english", labelKey: "language.english" },
  { value: "hindi", labelKey: "language.hindi" },
];

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (
    key: keyof SearchFilters,
    value: string | string[] | boolean,
  ) => void;
  onResetFilters: () => void;
}
export function FilterPanel({
  filters,
  onFilterChange,
  onResetFilters,
}: FilterPanelProps) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      const unique = await getUniqueCategories();
      setCategories(unique.filter((c) => !HIDDEN_CATEGORIES.includes(c)));
    };

    loadFilterOptions();
  }, []);

  const durationOptions = DURATION_BANDS.filter(
    (band) => band.label !== "Any Duration",
  );
  const handleDurationToggle = (label: string) => {
    const current = filters.durationBands || [];
    const newValue = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];
    onFilterChange("durationBands", newValue);
  };
  const handleYearToggle = (year: string) => {
    const current = filters.years || [];
    const newValue = current.includes(year)
      ? current.filter((y) => y !== year)
      : [...current, year];
    onFilterChange("years", newValue);
  };
  const handleLanguageToggle = (value: Language) => {
    onFilterChange("language", filters.language === value ? "" : value);
  };
  const handleCategoryToggle = (category: string) => {
    const current = filters.categories || [];
    const newValue = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFilterChange("categories", newValue);
  };
  const getDurationDisplayText = () => {
    const selected = filters.durationBands || [];
    if (selected.length === 0) return t("filters.allDurations");
    if (selected.length === 1)
      return formatDurationLabel(selected[0], i18n.language);
    return `${selected.length} ${t("filters.selected")}`;
  };
  const getYearDisplayText = () => {
    const selected = filters.years || [];
    if (selected.length === 0) return t("filters.allYears");
    if (selected.length === 1) return selected[0];
    return `${selected.length} ${t("filters.selected")}`;
  };
  const getCategoryKey = (category: string): string => {
    return category.toLowerCase();
  };

  const selectedCategories = filters.categories || [];

  return (
    <div className="w-full bg-card/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-border/50 animate-fade-in space-y-2">
      {/* Dropdowns and pills stack on small screens and share a single line
          from lg up, where there is room for both. */}
      <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-center lg:gap-3">
        {/* Dropdown filters: Duration and Year. Full width on phones, but capped
            from md up so they don't stretch into oversized bars on a laptop. */}
        <div className="grid w-full grid-cols-2 gap-2 md:w-auto md:max-w-md lg:flex lg:max-w-none lg:shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className={DROPDOWN_TRIGGER_CLASS}>
              <span className="truncate">{getDurationDisplayText()}</span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuCheckboxItem
                checked={(filters.durationBands || []).length === 0}
                onCheckedChange={() => onFilterChange("durationBands", [])}
              >
                {t("filters.allDurations")}
              </DropdownMenuCheckboxItem>
              {durationOptions.map((band) => {
                const displayLabel = formatDurationLabel(
                  band.label,
                  i18n.language,
                );
                const isSelected = (filters.durationBands || []).includes(
                  band.label,
                );
                return (
                  <DropdownMenuCheckboxItem
                    key={band.label}
                    checked={isSelected}
                    onCheckedChange={() => handleDurationToggle(band.label)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {displayLabel}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className={DROPDOWN_TRIGGER_CLASS}>
              <span className="truncate">{getYearDisplayText()}</span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 max-h-64 overflow-y-auto"
            >
              <DropdownMenuCheckboxItem
                checked={(filters.years || []).length === 0}
                onCheckedChange={() => onFilterChange("years", [])}
              >
                {t("filters.allYears")}
              </DropdownMenuCheckboxItem>
              {YEARS.map((year) => {
                const isSelected = (filters.years || []).includes(year);
                return (
                  <DropdownMenuCheckboxItem
                    key={year}
                    checked={isSelected}
                    onCheckedChange={() => handleYearToggle(year)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {year}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <FilterSeparator className="hidden lg:block" />

        {/* Pill filters: Language, then Category, then Free. Every pill gets
            the same fixed width so the groups stay visually uniform however
            many options each one happens to have. */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {LANGUAGE_OPTIONS.map((option) => (
            <FilterPill
              key={option.value}
              className={PILL_CLASS}
              selected={filters.language === option.value}
              onClick={() => handleLanguageToggle(option.value)}
            >
              {t(option.labelKey)}
            </FilterPill>
          ))}
          <FilterSeparator className="hidden sm:block" />
          {categories.map((category) => (
            <FilterPill
              key={category}
              className={PILL_CLASS}
              selected={selectedCategories.includes(category)}
              onClick={() => handleCategoryToggle(category)}
            >
              {t(`category.${getCategoryKey(category)}`, category)}
            </FilterPill>
          ))}
          <FilterSeparator className="hidden sm:block" />
          <FilterPill
            className={PILL_CLASS}
            selected={filters.freeOnly}
            onClick={() => onFilterChange("freeOnly", !filters.freeOnly)}
          >
            {t("filters.freeOnly")}
          </FilterPill>
        </div>
      </div>

      {/* Text Search and Reset Filter */}
      <div className="flex gap-2">
        <Input
          placeholder={t("filters.searchPlaceholder")}
          value={filters.titleSearch}
          onChange={(e) => onFilterChange("titleSearch", e.target.value)}
          className="bg-background/50 border-border/50 hover:border-primary/30 transition-colors flex-1 h-8"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-muted/40 transition-colors whitespace-nowrap rounded-md border border-border/60 hover:border-border h-8"
          title={t("filters.reset")}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("filters.reset")}</span>
        </button>
      </div>
    </div>
  );
}
