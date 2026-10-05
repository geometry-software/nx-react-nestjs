import { createI18n } from 'geometry-sdk/components';
import { en } from '../locales/en.locale';
import { es } from '../locales/es.locale';
import { pt } from '../locales/pt.locale';
import type { TranslationKey } from '../locales/locale';

export const languageConfiguration = {
  en: {
    htmlLanguage: 'en',
    intlLocale: 'en-US',
    code: 'EN',
    label: 'English',
  },
  es: {
    htmlLanguage: 'es',
    intlLocale: 'es-ES',
    code: 'ES',
    label: 'Español',
  },
  pt: {
    htmlLanguage: 'pt-BR',
    intlLocale: 'pt-BR',
    code: 'PT',
    label: 'Português',
  },
} as const;

export type Language = keyof typeof languageConfiguration;

export const {
  I18nProvider,
  isLanguage,
  languageOptions,
  supportedLanguages,
  useI18n,
} = createI18n<Language, TranslationKey>({
  defaultLanguage: 'en',
  storageKey: 'nx-language',
  languages: languageConfiguration,
  messages: { en, es, pt },
});

export type { Translate } from '../locales/locale';
