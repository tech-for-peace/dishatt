import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { DarkModeToggle } from "./DarkModeToggle";

/**
 * Hero content only — bg-hero lives on the Index wrapper so it can
 * stretch under half the filter bar.
 * Tagline wraps and sits a little below vertical center; toggles stay absolute top-right.
 */
export function Header() {
  const { t } = useTranslation();

  return (
    <header className="relative flex min-h-9 items-center px-4 py-1.5 text-primary-foreground md:py-2">
      <div className="absolute top-1.5 right-2 z-30 flex flex-col items-end gap-1 md:top-1/2 md:right-4 md:-translate-y-1/2 md:flex-row md:items-center md:gap-1.5">
        <LanguageSwitcher />
        <DarkModeToggle />
      </div>
      <div className="container relative z-10 mx-auto max-w-6xl pr-12 pl-2 pt-1.5 text-left md:px-48 md:pt-2 md:text-center lg:px-44">
        <p className="text-sm leading-snug text-primary-foreground/85 line-clamp-2 md:text-base md:leading-snug dark:text-white/90">
          {t("header.tagline")}
        </p>
      </div>
    </header>
  );
}
