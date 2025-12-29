// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
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
        <Button variant="outline" size="sm" className="h-9 gap-2 px-3">
          <Globe className="h-4 w-4" />
          <span className="font-medium">{currentLang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={`flex items-center justify-between ${i18n.language === 'en' ? 'bg-accent' : ''}`}
        >
          <span>English</span>
          <span className="text-muted-foreground text-xs">EN</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('hi')}
          className={`flex items-center justify-between ${i18n.language === 'hi' ? 'bg-accent' : ''}`}
        >
          <span>हिंदी</span>
          <span className="text-muted-foreground text-xs">HI</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}