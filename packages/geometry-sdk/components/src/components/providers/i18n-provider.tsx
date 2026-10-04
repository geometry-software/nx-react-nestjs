import {
  createContext,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createRequiredContextHook } from '../hooks/create-required-context-hook.js';

export type TranslationValues = Record<string, string | number>;
export type Translate<TKey extends string = string> = (
  key: TKey,
  values?: TranslationValues,
) => string;
export type TranslationCatalog<TKey extends string = string> = Record<
  TKey,
  string
>;

export type LanguageDefinition = {
  htmlLanguage: string;
  intlLocale: string;
  code: string;
  label: string;
};

export type I18nConfiguration<
  TLanguage extends string,
  TKey extends string = string,
> = {
  defaultLanguage: TLanguage;
  storageKey: string;
  languages: Record<TLanguage, LanguageDefinition>;
  messages: Record<TLanguage, TranslationCatalog<TKey>>;
};

export interface I18nValue<
  TLanguage extends string,
  TKey extends string = string,
> {
  language: TLanguage;
  setLanguage: (language: TLanguage) => void;
  translate(key: TKey, values?: TranslationValues): string;
}

export function createI18n<
  TLanguage extends string,
  TKey extends string = string,
>(
  configuration: I18nConfiguration<TLanguage, TKey>,
) {
  const I18nContext = createContext<I18nValue<TLanguage, TKey> | null>(null);
  const supportedLanguages = Object.keys(
    configuration.languages,
  ) as TLanguage[];
  const languageOptions = supportedLanguages.map((value) => ({
    value,
    code: configuration.languages[value].code,
    label: configuration.languages[value].label,
  }));

  const isLanguage = (value: unknown): value is TLanguage =>
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(configuration.languages, value);

  const resolveInitialLanguage = (): TLanguage => {
    if (typeof window === 'undefined') return configuration.defaultLanguage;

    const storedLanguage = window.localStorage.getItem(configuration.storageKey);
    if (isLanguage(storedLanguage)) return storedLanguage;

    return (
      resolveBrowserLanguage(
        [...window.navigator.languages, window.navigator.language],
        configuration.languages,
      ) ?? configuration.defaultLanguage
    );
  };

  function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<TLanguage>(resolveInitialLanguage);

    useEffect(() => {
      window.localStorage.setItem(configuration.storageKey, language);
      document.documentElement.lang =
        configuration.languages[language].htmlLanguage;
    }, [language]);

    const value = useMemo<I18nValue<TLanguage, TKey>>(
      () => ({
        language,
        setLanguage,
        translate(key, values = {}) {
          const template =
            configuration.messages[language][key] ??
            configuration.messages[configuration.defaultLanguage][key] ??
            key;

          return Object.entries(values).reduce(
            (text, [name, replacement]) =>
              text.split(`{{${name}}}`).join(String(replacement)),
            template,
          );
        },
      }),
      [language],
    );

    return (
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
  }

  const useI18n = createRequiredContextHook(
    I18nContext,
    'useI18n must be used inside I18nProvider',
  );

  return {
    I18nProvider,
    isLanguage,
    languageOptions,
    supportedLanguages,
    useI18n,
  };
}

function resolveBrowserLanguage<TLanguage extends string>(
  browserLanguages: readonly string[],
  languages: Record<TLanguage, LanguageDefinition>,
): TLanguage | undefined {
  const entries = Object.entries(languages) as Array<
    [TLanguage, LanguageDefinition]
  >;

  for (const browserLanguage of browserLanguages) {
    const normalized = browserLanguage.toLowerCase();
    const exactMatch = entries.find(
      ([language, definition]) =>
        language.toLowerCase() === normalized ||
        definition.htmlLanguage.toLowerCase() === normalized ||
        definition.intlLocale.toLowerCase() === normalized,
    );
    if (exactMatch) return exactMatch[0];

    const baseLanguage = normalized.split('-')[0];
    const baseMatch = entries.find(
      ([language, definition]) =>
        language.toLowerCase() === baseLanguage ||
        definition.htmlLanguage.toLowerCase().split('-')[0] === baseLanguage,
    );
    if (baseMatch) return baseMatch[0];
  }

  return undefined;
}
