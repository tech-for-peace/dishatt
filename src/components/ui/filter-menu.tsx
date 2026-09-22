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

interface FilterMenuBase {
  /** Shown on the trigger when nothing is selected (e.g. "All Languages"). */
  label: string;
  options: FilterMenuOption[];
  className?: string;
}

interface SingleFilterMenuProps extends FilterMenuBase {
  mode: "single";
  value: string;
  onChange: (value: string) => void;
}

interface MultiFilterMenuProps extends FilterMenuBase {
  mode: "multi";
  values: string[];
  onChange: (values: string[]) => void;
}

type FilterMenuProps = SingleFilterMenuProps | MultiFilterMenuProps;

const TRIGGER_CLASS =
  "flex h-8 w-full items-center justify-between rounded-none border border-border/50 bg-background/50 px-3 py-1 text-sm ring-offset-background hover:border-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export function FilterMenu(props: FilterMenuProps) {
  const { t } = useTranslation();
  const { label, options, className } = props;

  const isMulti = props.mode === "multi";
  const selectedCount = isMulti ? props.values.length : props.value ? 1 : 0;
  const isActive = selectedCount > 0;

  const displayText = (() => {
    if (!isActive) return label;
    if (isMulti) {
      if (props.values.length === 1) {
        return options.find((o) => o.value === props.values[0])?.label ?? label;
      }
      return `${props.values.length} ${t("filters.selected")}`;
    }
    return options.find((o) => o.value === props.value)?.label ?? label;
  })();

  const handleSingleToggle = (optionValue: string) => {
    if (props.mode !== "single") return;
    props.onChange(props.value === optionValue ? "" : optionValue);
  };

  const handleMultiToggle = (optionValue: string) => {
    if (props.mode !== "multi") return;
    const next = props.values.includes(optionValue)
      ? props.values.filter((v) => v !== optionValue)
      : [...props.values, optionValue];
    props.onChange(next);
  };

  const handleClear = () => {
    if (isMulti) {
      props.onChange([]);
    } else {
      props.onChange("");
    }
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
          onCheckedChange={handleClear}
          onSelect={(e) => {
            if (isMulti) e.preventDefault();
          }}
        >
          {label}
        </DropdownMenuCheckboxItem>
        {options.map((option) => {
          const checked = isMulti
            ? props.values.includes(option.value)
            : props.value === option.value;
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={checked}
              onCheckedChange={() =>
                isMulti ? handleMultiToggle(option.value) : handleSingleToggle(option.value)
              }
              onSelect={(e) => {
                if (isMulti) e.preventDefault();
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
