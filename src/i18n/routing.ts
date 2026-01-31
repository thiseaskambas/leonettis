import { defineRouting } from 'next-intl/routing';

export const locales = {
  en: { label: 'English', value: 'en', icon: '🇬🇧', short: 'En' },
  fr: { label: 'Français', value: 'fr', icon: '🇫🇷', short: 'Fr' },
  gr: { label: 'Ελληνικά', value: 'gr', icon: '🇬🇷', short: 'Gr' },
} as const;

export type Locale = keyof typeof locales;
export type ILocale = (typeof locales)[Locale];

const localeCodes = Object.keys(locales) as Locale[];

export const routing = defineRouting({
  locales: localeCodes,
  defaultLocale: locales.en.value,
  localePrefix: 'always',
});
