import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterMenuOption {
  value: string;
  label: string;
}

interface FilterMenuProps {
  /** Shown on the trigger when nothing is selected (e.g. "All Durations"). */
  label: string;
  options: FilterMenuOption[];
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

const TRIGGER_CLASS =
  "flex h-9 w-full items-center justify-between rounded-none border-0 bg-transparent px-3 py-1 text-sm text-foreground ring-offset-background transition-colors hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export function FilterMenu({ label, options, values, onChange, className }: FilterMenuProps) {
  const { t } = useTranslation();
  const isActive = values.length > 0;

  const displayText = (() => {
    if (!isActive) return label;
    if (values.length === 1) {
      return options.find((o) => o.value === values[0])?.label ?? label;
    }
    return `${values.length} ${t("filters.selected")}`;
  })();

  const handleToggle = (optionValue: string) => {
    const next = values.includes(optionValue)
      ? values.filter((v) => v !== optionValue)
      : [...values, optionValue];
    onChange(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(TRIGGER_CLASS, className)}>
        <span className="truncate">{displayText}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-64 w-48 overflow-y-auto rounded-none">
        <DropdownMenuCheckboxItem
          checked={!isActive}
          onCheckedChange={() => onChange([])}
          onSelect={(e) => e.preventDefault()}
        >
          {label}
        </DropdownMenuCheckboxItem>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={values.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
