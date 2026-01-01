import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
export function Header() {
  const { t } = useTranslation();
  return (
    <header className="bg-hero text-primary-foreground py-8 md:py-16 px-4 relative overflow-hidden">
      {/* Language switcher in top-right corner */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full
                         bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 rounded-full
                         bg-primary-foreground/10 blur-3xl" />
      </div>
      <div className="container max-w-4xl mx-auto text-center relative z-10">
        <p
          className="text-base md:text-lg md:text-xl text-primary-foreground/80
                     max-w-2xl mx-auto animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          {t('header.tagline')}
        </p>
      </div>
    </header>
  );
}
