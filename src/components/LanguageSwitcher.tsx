import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "hi" ? "en" : "hi");
  };

  const currentLang = i18n.language === "hi" ? "हि" : "EN";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="h-5 gap-1 bg-white px-1 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl border-gray-300 md:h-7 md:px-2 lg:h-8 lg:px-2.5"
    >
      <Globe className="h-2 w-2 text-gray-700 md:h-3.5 md:w-3.5" />
      <span className="hidden font-semibold text-gray-800 md:inline md:text-xs lg:text-sm">
        {currentLang}
      </span>
    </Button>
  );
}
