import { LayoutGrid, Music, Video } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Language } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LangCategoryTabsProps {
  language: Language;
  category: string;
  onLanguageChange: (language: Language) => void;
  onCategoryChange: (category: string) => void;
  onClear: () => void;
}

function Word({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap border-b-2 px-1.5 py-1 font-heading text-sm transition-colors",
        "md:gap-1.5 md:px-2 md:text-base lg:gap-2 lg:px-2.5 lg:text-xl",
        "cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-foreground font-semibold text-foreground"
          : "border-transparent text-foreground/80 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * All || Hindi | EN ‖ Video | Music
 * One shared All clears both language and category.
 */
export function LangCategoryTabs({
  language,
  category,
  onLanguageChange,
  onCategoryChange,
  onClear,
}: LangCategoryTabsProps) {
  const { t } = useTranslation();
  const allActive = language === "" && category === "";

  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-x-1.5 md:gap-x-2 lg:gap-x-4">
      <Word
        active={allActive}
        label={t("sources.all")}
        onClick={onClear}
        icon={<LayoutGrid className="h-3.5 w-3.5 text-sky-500 md:h-4 md:w-4 lg:h-5 lg:w-5" />}
      />

      {/* || visual break between All and language group */}
      <span aria-hidden className="w-1.5 shrink-0 md:w-2" />

      <div className="flex items-center gap-x-1.5 md:gap-x-2 lg:gap-x-4">
        <Word
          active={language === "hindi"}
          label={t("language.hindi")}
          icon={
            <span className="text-xs font-semibold leading-none text-orange-500 md:text-sm lg:text-base">
              हि
            </span>
          }
          onClick={() => onLanguageChange("hindi")}
        />
        <Word
          active={language === "english"}
          label={t("language.english")}
          icon={
            <span className="text-[10px] font-semibold leading-none tracking-wide text-blue-600 md:text-xs lg:text-sm">
              EN
            </span>
          }
          onClick={() => onLanguageChange("english")}
        />
      </div>

      {/* ‖ separator between language and category */}
      <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-border md:mx-1 md:h-5 lg:h-6" />

      <div className="flex items-center gap-x-1.5 md:gap-x-2 lg:gap-x-4">
        <Word
          active={category === "Video"}
          label={t("category.video")}
          icon={<Video className="h-3.5 w-3.5 text-rose-500 md:h-4 md:w-4 lg:h-5 lg:w-5" />}
          onClick={() => onCategoryChange("Video")}
        />
        <Word
          active={category === "Music"}
          label={t("category.music")}
          icon={<Music className="h-3.5 w-3.5 text-emerald-500 md:h-4 md:w-4 lg:h-5 lg:w-5" />}
          onClick={() => onCategoryChange("Music")}
        />
      </div>
    </div>
  );
}
