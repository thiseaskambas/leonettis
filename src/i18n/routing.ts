import { defineRouting } from 'next-intl/routing';

export const locales = {
  en: { label: 'English', value: 'en', short: 'En' },
  fr: { label: 'Français', value: 'fr', short: 'Fr' },
  gr: { label: 'Ελληνικά', value: 'gr', short: 'Gr' },
  de: { label: 'Deutsch', value: 'de', short: 'De' },
  it: { label: 'Italiano', value: 'it', short: 'It' },
} as const;

export type Locale = keyof typeof locales;
export type ILocale = (typeof locales)[Locale];

const localeCodes = Object.keys(locales) as Locale[];

export const routing = defineRouting({
  locales: localeCodes,
  defaultLocale: locales.en.value,
  localePrefix: 'always',
});
