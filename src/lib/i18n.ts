import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "../locales/en.json";
import hiTranslations from "../locales/hi.json";

const STORAGE_KEY = "disha-language-preference";

const isValidLanguage = (value: unknown): value is "en" | "hi" => {
  return value === "en" || value === "hi";
};

const getInitialLanguage = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidLanguage(saved)) {
      return saved;
    }
    return "hi";
  } catch {
    return "hi";
  }
};

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "hi",
  supportedLngs: ["en", "hi"],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch {
    // localStorage may be unavailable
  }
});

export default i18n;
