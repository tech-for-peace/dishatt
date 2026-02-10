// src/components/LanguageSwitcher.tsx
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Globe } from "lucide-react";
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  const currentLang = i18n.language === "hi" ? "हि" : "EN";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-5 md:h-10 gap-1 px-1 md:px-3 bg-white border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200`}
        >
          <Globe className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />
          <span className="font-semibold text-xs md:text-sm text-gray-800 hidden md:inline">
            {currentLang}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`min-w-[140px] bg-white border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-600`}
      >
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={`flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
            i18n.language === "en" ? "bg-accent" : ""
          }`}
        >
          <span className="dark:text-white">English</span>
          <span className="text-muted-foreground text-xs dark:text-gray-300">
            EN
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("hi")}
          className={`flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
            i18n.language === "hi" ? "bg-accent" : ""
          }`}
        >
          <span className="dark:text-white">हिंदी</span>
          <span className="text-muted-foreground text-xs dark:text-gray-300">
            HI
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
