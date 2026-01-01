// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Globe } from 'lucide-react';
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  const currentLang = i18n.language === 'hi' ? 'हि' : 'EN';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-5 md:h-10 gap-1 px-1 md:px-3 bg-white border-gray-300
                     hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Globe className="h-2 w-2 md:h-4 md:w-4 text-gray-700" />
          <span className="font-semibold text-xs md:text-sm text-gray-800">
            {currentLang}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[140px] bg-white border-gray-300 shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={`flex items-center justify-between ${
            i18n.language === 'en' ? 'bg-accent' : ''
          }`}
        >
          <span>English</span>
          <span className="text-muted-foreground text-xs">EN</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('hi')}
          className={`flex items-center justify-between ${
            i18n.language === 'hi' ? 'bg-accent' : ''
          }`}
        >
          <span>हिंदी</span>
          <span className="text-muted-foreground text-xs">HI</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}