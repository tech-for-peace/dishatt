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
      className="h-5 md:h-10 gap-1 px-1 md:px-3 bg-white border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <Globe className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />
      <span className="font-semibold text-xs md:text-sm text-gray-800 hidden md:inline">
        {currentLang}
      </span>
    </Button>
  );
}
