import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DarkModeToggle } from "./DarkModeToggle";

export function Header() {
  const { t } = useTranslation();
  return (
    <header className="relative flex items-center justify-center overflow-hidden bg-hero px-4 py-8 text-primary-foreground md:py-16">
      {/* Language switcher and dark mode toggle in top-right corner.
          Stacked on phones so they don't eat into the tagline. */}
      <div className="absolute top-3 right-2 z-30 flex flex-col items-end gap-1.5 md:top-4 md:right-4 md:flex-row md:items-center md:gap-2">
        <LanguageSwitcher />
        <DarkModeToggle />
      </div>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full
                         bg-secondary/20 blur-3xl"
        />
        <div
          className="absolute -bottom-1/2 -left-1/4 w-96 h-96 rounded-full
                         bg-primary-foreground/10 blur-3xl"
        />
      </div>
      <div className="container relative z-10 mx-auto max-w-4xl px-12 text-center md:px-4">
        <p
          className="mx-auto animate-slide-up text-sm leading-relaxed text-primary-foreground/80 line-clamp-2 md:text-lg md:leading-normal dark:text-white/90"
          style={{ animationDelay: "100ms" }}
        >
          {t("header.tagline")}
        </p>
      </div>
    </header>
  );
}
