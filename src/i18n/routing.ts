import { defineRouting } from 'next-intl/routing';

export const locales = {
  en: { label: 'English', value: 'en', short: 'En', languageTag: 'en' },
  fr: { label: 'Français', value: 'fr', short: 'Fr', languageTag: 'fr' },
  gr: { label: 'Ελληνικά', value: 'gr', short: 'Gr', languageTag: 'el-GR' },
  de: { label: 'Deutsch', value: 'de', short: 'De', languageTag: 'de' },
  it: { label: 'Italiano', value: 'it', short: 'It', languageTag: 'it' },
} as const;

export type Locale = keyof typeof locales;
export type ILocale = (typeof locales)[Locale];
export type LocaleLanguageTag = (typeof locales)[Locale]['languageTag'];

export const localeCodes = Object.keys(locales) as Locale[];

export const routing = defineRouting({
  locales: localeCodes,
  defaultLocale: locales.en.value,
  localePrefix: 'always',
});

export function isValidLocale(
  locale: unknown
): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export function getLocaleLanguageTag(locale: Locale): LocaleLanguageTag {
  return locales[locale].languageTag;
}
