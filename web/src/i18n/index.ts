import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";

export const supportedLanguages = ["en", "fa", "fr", "de", "tr", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const rtlLanguages: SupportedLanguage[] = ["fa", "ar"];

const localeModules = {
  fa: () => import("./locales/fa.json"),
  fr: () => import("./locales/fr.json"),
  de: () => import("./locales/de.json"),
  tr: () => import("./locales/tr.json"),
  ar: () => import("./locales/ar.json"),
} as const;

async function loadLocale(lng: string) {
  if (lng === "en") return;
  const loader = (localeModules as any)[lng];
  if (!loader) return;
  try {
    const resources = await loader();
    i18n.addResourceBundle(lng, "translation", resources.default || resources);
  } catch (err) {
    console.error(`Failed to load locale ${lng}:`, err);
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
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

const detectedLng = i18n.language || "en";
if (detectedLng !== "en") {
  loadLocale(detectedLng);
}

i18n.on("languageChanged", (lng: string) => {
  if (lng && lng !== "en") {
    loadLocale(lng);
  }
});

export default i18n;
