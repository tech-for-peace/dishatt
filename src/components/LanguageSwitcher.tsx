import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";

  return (
    <div
      className="flex h-8 items-center rounded-full border border-white/25 bg-white/10 p-px"
      role="group"
      aria-label={t("filters.language")}
    >
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        className={cn(
          "h-7 rounded-full px-2 text-xs font-medium transition-colors",
          !isHindi
            ? "bg-white text-[hsl(200_55%_18%)]"
            : "text-white/70 hover:text-white",
        )}
        aria-pressed={!isHindi}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("hi")}
        className={cn(
          "h-7 rounded-full px-2 text-xs font-medium transition-colors",
          isHindi
            ? "bg-white text-[hsl(200_55%_18%)]"
            : "text-white/70 hover:text-white",
        )}
        aria-pressed={isHindi}
      >
        हिंदी
      </button>
    </div>
  );
}
