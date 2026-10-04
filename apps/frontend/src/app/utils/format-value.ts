import { languageConfiguration, type Language } from '@/app/locales/i18n';

export function getLanguageLocale(language: Language): string {
  return languageConfiguration[language].intlLocale;
}

export function formatDateTime(value: string, language: Language): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatCurrency(
  value: number,
  language: Language,
  currency = 'USD',
): string {
  return new Intl.NumberFormat(getLanguageLocale(language), {
    style: 'currency',
    currency,
  }).format(value);
}
