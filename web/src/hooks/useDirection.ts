import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { rtlLanguages, type SupportedLanguage } from '../i18n';

export function useDirection() {
  const { i18n } = useTranslation();

  const isRTL = rtlLanguages.includes(i18n.language as SupportedLanguage);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    // Add/remove RTL class on body for global styling
    if (isRTL) {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [isRTL, i18n.language]);

  return { isRTL };
}
