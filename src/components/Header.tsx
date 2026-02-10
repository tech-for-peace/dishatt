import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DarkModeToggle } from "./DarkModeToggle";

export function Header() {
  const { t } = useTranslation();
  return (
    <header
      className={`bg-hero text-primary-foreground py-6 md:py-16 px-4 relative overflow-hidden`}
    >
      {/* Language switcher and dark mode toggle in top-right corner */}
      <div className="absolute top-4 right-0 md:right-4 z-30 flex items-center gap-2">
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
      <div className="container max-w-4xl mx-auto text-center relative z-10">
        <p
          className="text-base md:text-lg text-primary-foreground/80 dark:text-white/90
                     max-w-2xl mx-auto animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          {t("header.tagline")}
        </p>
      </div>
    </header>
  );
}
