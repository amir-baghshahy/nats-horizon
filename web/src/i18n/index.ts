import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import fa from "./locales/fa.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import tr from "./locales/tr.json";
import ar from "./locales/ar.json";

export const supportedLanguages = ["en", "fa", "fr", "de", "tr", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const rtlLanguages: SupportedLanguage[] = ["fa", "ar"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
      fr: { translation: fr },
      de: { translation: de },
      tr: { translation: tr },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      lookupQuerystring: "lng",
    },
  });

export default i18n;
