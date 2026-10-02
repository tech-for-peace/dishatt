import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DarkModeToggle } from "./DarkModeToggle";

export function Header() {
  const { t } = useTranslation();
  return (
    /*
      Fixed top/bottom padding (not % centering) so the tagline sits near the
      top with little empty space above, and the bottom band stays free for
      FilterBar’s -mt-8 on every screen size.
    */
    <header className="relative flex shrink-0 overflow-hidden bg-hero pt-8 pb-10 text-primary-foreground sm:pt-9 sm:pb-11 md:pt-10 md:pb-12">
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
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pr-14 text-center sm:px-6 sm:pr-16 md:px-8 md:pr-8">
        <p
          className="mx-auto max-w-[20rem] animate-slide-up text-pretty text-balance text-sm leading-snug text-primary-foreground/80 sm:max-w-md sm:text-base sm:leading-relaxed md:max-w-xl md:text-lg dark:text-white/90"
          style={{ animationDelay: "100ms" }}
        >
          {t("header.tagline")}
        </p>
      </div>
    </header>
  );
}
