import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import type { SortOrder } from "@/lib/types";

interface SortToggleProps {
  order: SortOrder;
  onChange: (order: SortOrder) => void;
}

export function SortToggle({ order, onChange }: SortToggleProps) {
  const { t } = useTranslation();
  const Icon = order === "newest" ? ArrowDownWideNarrow : ArrowUpNarrowWide;

  return (
    <Button
      onClick={() => onChange(order === "newest" ? "oldest" : "newest")}
      title={t("sort.toggle")}
    >
      <Icon />
      {t(`sort.${order}`)}
    </Button>
  );
}
