import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

import { FilterMenu } from "@/components/ui/filter-menu";
import { Input } from "@/components/ui/input";
import { getUniqueCategories } from "@/lib/data";
import { SearchFilters, DURATION_BANDS, YEARS, Language } from "@/lib/types";

const formatDurationLabel = (label: string, language: string): string => {
  if (label === "Any Duration") return label;

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
  onFilterChange: (key: keyof SearchFilters, value: string | string[] | boolean) => void;
  onResetFilters: () => void;
}

export function FilterBar({ filters, onFilterChange, onResetFilters }: FilterBarProps) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getUniqueCategories().then(setCategories);
  }, []);

  const durationOptions = DURATION_BANDS.filter((band) => band.label !== "Any Duration").map(
    (band) => ({
      value: band.label,
      label: formatDurationLabel(band.label, i18n.language),
    }),
  );

  const languageOptions = [
    { value: "english", label: t("language.english") },
    { value: "hindi", label: t("language.hindi") },
  ];

  const categoryOptions = categories.map((category) => ({
    value: category,
    label: t(`category.${category.toLowerCase()}`, category),
  }));

  const yearOptions = YEARS.map((year) => ({ value: year, label: year }));

  const freeCheckbox = (
    <label className="flex h-8 cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-none border border-border/60 px-3 py-1 text-sm font-medium text-foreground/80 transition-colors hover:border-border hover:text-foreground">
      <input
        type="checkbox"
        checked={filters.freeOnly}
        onChange={(e) => onFilterChange("freeOnly", e.target.checked)}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      <span>{t("filters.freeOnly")}</span>
    </label>
  );

  return (
    <div className="relative z-20 -mt-8 md:-mt-20">
      <div className="w-full animate-fade-in rounded-none border border-border/50 bg-card/80 p-2.5 shadow-soft backdrop-blur-sm">
        {/* Dropdowns above search — same layout as main */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
          <FilterMenu
            label={t("filters.allLanguages")}
            mode="single"
            value={filters.language}
            options={languageOptions}
            onChange={(value) => onFilterChange("language", value as Language)}
          />
          <FilterMenu
            label={t("filters.allCategories")}
            mode="multi"
            values={filters.categories || []}
            options={categoryOptions}
            onChange={(values) => onFilterChange("categories", values)}
          />
          <FilterMenu
            label={t("filters.allDurations")}
            mode="multi"
            values={filters.durationBands || []}
            options={durationOptions}
            onChange={(values) => onFilterChange("durationBands", values)}
          />
          <FilterMenu
            label={t("filters.allYears")}
            mode="multi"
            values={filters.years || []}
            options={yearOptions}
            onChange={(values) => onFilterChange("years", values)}
          />
        </div>

        <div className="mt-1.5 flex gap-1.5">
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={filters.titleSearch}
            onChange={(e) => onFilterChange("titleSearch", e.target.value)}
            className="h-8 flex-1 rounded-none border-border/50 bg-background/50 transition-colors hover:border-primary/30"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {freeCheckbox}
          <button
            type="button"
            onClick={onResetFilters}
            className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-none border border-border/60 px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
            title={t("filters.reset")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("filters.reset")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
