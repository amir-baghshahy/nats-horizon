import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supportedLanguages, type SupportedLanguage } from "../i18n";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  fa: "فارسی",
  fr: "Français",
  de: "Deutsch",
  tr: "Türkçe",
  ar: "العربية",
};

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentLang = (
    supportedLanguages.includes(i18n.language as SupportedLanguage)
      ? i18n.language
      : "en"
  ) as SupportedLanguage;

  const handleChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    // Update URL parameter
    searchParams.set('lng', lang);
    setSearchParams(searchParams);
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-dark-border/60 bg-dark-bg/45 p-1 flex-wrap">
      <Globe className="h-3.5 w-3.5 text-dark-muted mx-1.5" />
      {supportedLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => handleChange(lang)}
          className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
            currentLang === lang
              ? "bg-primary-600 text-white"
              : "text-dark-muted hover:bg-dark-bg/70 hover:text-dark-text"
          }`}
          aria-label={t("language.select") + ": " + LANGUAGE_LABELS[lang]}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
