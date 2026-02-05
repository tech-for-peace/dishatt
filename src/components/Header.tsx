import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DarkModeToggle } from "./DarkModeToggle";

export function Header() {
  return (
    <header className="bg-hero text-primary-foreground py-6 md:py-16 px-4 relative overflow-hidden">
      {/* Language switcher and dark mode toggle in top-right corner */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <DarkModeToggle />
        <LanguageSwitcher />
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
    </header>
  );
}
