import { type ReactNode } from "react";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { DarkModeToggle } from "./DarkModeToggle";

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-2 px-4 py-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-5 lg:gap-8">
      <h1 className="font-heading shrink-0 text-2xl font-bold leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:text-3xl">
        Disha
      </h1>
      {children ? (
        <div className="order-last col-span-2 min-w-0 sm:order-none sm:col-span-1">
          {children}
        </div>
      ) : null}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <LanguageSwitcher />
        <DarkModeToggle />
      </div>
    </header>
  );
}
