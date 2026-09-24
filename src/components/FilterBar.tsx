import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

import { FilterMenu } from "@/components/ui/filter-menu";
import { Input } from "@/components/ui/input";
import { SearchFilters, DURATION_BANDS, YEARS } from "@/lib/types";
import { cn } from "@/lib/utils";

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

/**
 * Opaque filter panel (straddles hero green via Index -mt).
 * Mobile: two divide-y rows. md+: one divide-x row.
 */
export function FilterBar({ filters, onFilterChange, onResetFilters }: FilterBarProps) {
  const { t, i18n } = useTranslation();

  const durationOptions = DURATION_BANDS.filter((band) => band.label !== "Any Duration").map(
    (band) => ({
      value: band.label,
      label: formatDurationLabel(band.label, i18n.language),
    }),
  );

  const yearOptions = YEARS.map((year) => ({ value: year, label: year }));

  const cell =
    "flex h-9 min-w-0 items-center bg-transparent text-foreground focus-within:bg-muted/30";

  const search = (
    <Input
      placeholder={t("filters.searchPlaceholder")}
      value={filters.titleSearch}
      onChange={(e) => onFilterChange("titleSearch", e.target.value)}
      className={cn(cell, "flex-1 rounded-none border-0 shadow-none")}
      inputMode="search"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  );

  const freeCheckbox = (
    <label
      className={cn(
        cell,
        "shrink-0 cursor-pointer select-none gap-2 whitespace-nowrap px-3 text-sm font-medium",
      )}
    >
      <input
        type="checkbox"
        checked={filters.freeOnly}
        onChange={(e) => onFilterChange("freeOnly", e.target.checked)}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      <span>{t("filters.freeOnly")}</span>
    </label>
  );

  const durationMenu = (
    <FilterMenu
      label={t("filters.allDurations")}
      values={filters.durationBands}
      options={durationOptions}
      onChange={(values) => onFilterChange("durationBands", values)}
      className="min-w-0 flex-1 px-2 md:w-32 md:flex-none"
    />
  );

  const yearMenu = (
    <FilterMenu
      label={t("filters.allYears")}
      values={filters.years}
      options={yearOptions}
      onChange={(values) => onFilterChange("years", values)}
      className="min-w-0 flex-1 px-2 md:w-28 md:flex-none"
    />
  );

  const resetButton = (
    <button
      type="button"
      onClick={onResetFilters}
      className={cn(
        cell,
        "shrink-0 gap-1.5 whitespace-nowrap px-3 text-xs font-medium hover:bg-muted/40",
      )}
      title={t("filters.reset")}
    >
      <RefreshCw className="h-3.5 w-3.5" />
      <span className="hidden md:inline">{t("filters.reset")}</span>
    </button>
  );

  const panel = "overflow-hidden rounded-none border border-border bg-card";
  const row = "flex min-w-0 divide-x divide-border";

  return (
    <div className={panel}>
      {/* Mobile: Search|Free / Duration|Year|Reset */}
      <div className="divide-y divide-border md:hidden">
        <div className={row}>
          {search}
          {freeCheckbox}
        </div>
        <div className={row}>
          {durationMenu}
          {yearMenu}
          {resetButton}
        </div>
      </div>

      {/* Tablet + laptop: one row */}
      <div className={cn(row, "hidden md:flex")}>
        {search}
        {freeCheckbox}
        {durationMenu}
        {yearMenu}
        {resetButton}
      </div>
    </div>
  );
}
