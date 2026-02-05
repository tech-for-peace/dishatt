// src/lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "../locales/en.json";
import hiTranslations from "../locales/hi.json";
const STORAGE_KEY = "disha-language-preference";
// Get the saved language or default to Hindi
const isValidLanguage = (value: unknown): value is "en" | "hi" => {
  return value === "en" || value === "hi";
};

const getInitialLanguage = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Validate that saved value is a supported language
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
// Initialize i18next
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
// Listen for language changes
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch {
    // Silent error handling for localStorage
  }
});
export default i18n;
