import { useTranslation } from "react-i18next";
import { RefreshCw, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  SearchFilters,
  DURATION_BANDS,
  YEARS,
  Language,
  Source,
} from "@/lib/types";
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
interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string | string[]) => void;
  onResetFilters: () => void;
}
export function FilterPanel({
  filters,
  onFilterChange,
  onResetFilters,
}: FilterPanelProps) {
  const { t, i18n } = useTranslation();
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
  return (
    <div
      className="w-full bg-card/80 backdrop-blur-sm rounded-xl p-4
                 shadow-soft border border-border/50 animate-fade-in"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          value={filters.language || "all"}
          onValueChange={(value) =>
            onFilterChange(
              "language",
              value === "all" ? "" : (value as Language),
            )
          }
        >
          <SelectTrigger
            className="bg-background/50 border-border/50
                                     hover:border-primary/30 transition-colors h-9"
          >
            <SelectValue placeholder={t("filters.language")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allLanguages")}</SelectItem>
            <SelectItem value="english">{t("language.english")}</SelectItem>
            <SelectItem value="hindi">{t("language.hindi")}</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-9 w-full items-center justify-between rounded-md
                     border border-border/50 bg-background/50 px-3 py-2 text-sm
                     ring-offset-background placeholder:text-muted-foreground
                     hover:border-primary/30 transition-colors focus:outline-none
                     focus:ring-2 focus:ring-ring focus:ring-offset-2
                     disabled:cursor-not-allowed disabled:opacity-50"
          >
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
          <DropdownMenuTrigger
            className="flex h-9 w-full items-center justify-between rounded-md
                     border border-border/50 bg-background/50 px-3 py-2 text-sm
                     ring-offset-background placeholder:text-muted-foreground
                     hover:border-primary/30 transition-colors focus:outline-none
                     focus:ring-2 focus:ring-ring focus:ring-offset-2
                     disabled:cursor-not-allowed disabled:opacity-50"
          >
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
        <Select
          value={filters.source || "all"}
          onValueChange={(value) =>
            onFilterChange("source", value === "all" ? "" : (value as Source))
          }
        >
          <SelectTrigger
            className="bg-background/50 border-border/50
                                     hover:border-primary/30 transition-colors h-9"
          >
            <SelectValue placeholder={t("filters.source")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allSources")}</SelectItem>
            <SelectItem value="youtube">{t("videoCard.youtube")}</SelectItem>
            <SelectItem value="timelesstoday">
              {t("videoCard.timelessToday")}
            </SelectItem>
            <SelectItem value="spotify">{t("videoCard.spotify")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Text Search */}
      <div className="mt-3">
        <div className="flex gap-2">
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={filters.titleSearch}
            onChange={(e) => onFilterChange("titleSearch", e.target.value)}
            className="bg-background/50 border-border/50 hover:border-primary/30
                   transition-colors flex-1"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal
                     text-muted-foreground/80 hover:text-foreground/80 hover:bg-muted/30
                     transition-colors whitespace-nowrap rounded-md border border-border/40
                     hover:border-border/60"
            title={t("filters.reset")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{t("filters.reset")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
