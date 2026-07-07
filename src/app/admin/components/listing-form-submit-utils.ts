import {
  type ListingFormSlugMode,
  slugify,
} from '@/app/lib/helpers/slug-helpers';

export const LISTING_FORM_LOCALES = ['en', 'fr', 'gr', 'de', 'it'] as const;
export type ListingFormLocaleCode = (typeof LISTING_FORM_LOCALES)[number];
export type NonEnglishListingFormLocaleCode = Exclude<
  ListingFormLocaleCode,
  'en'
>;
export type ListingFormLocalizedText = Record<ListingFormLocaleCode, string>;

const NON_ENGLISH_LOCALES: NonEnglishListingFormLocaleCode[] = [
  'fr',
  'gr',
  'de',
  'it',
];

export function getTitleTranslationSourceLocale(
  title: Partial<Record<ListingFormLocaleCode, string>>,
  activeLocale: ListingFormLocaleCode
): NonEnglishListingFormLocaleCode | null {
  if (activeLocale !== 'en' && title[activeLocale]?.trim()) {
    return activeLocale;
  }

  return NON_ENGLISH_LOCALES.find((locale) => title[locale]?.trim()) ?? null;
}

export function mergeRequiredEnglishTitleTranslation(
  title: ListingFormLocalizedText,
  translations: Partial<Record<ListingFormLocaleCode, string>> | undefined
): ListingFormLocalizedText | null {
  const titleEn = translations?.en?.trim();
  if (!titleEn) return null;

  return {
    ...title,
    ...translations,
    en: titleEn,
  };
}

export function hasInvalidManualCreateSlug(
  mode: ListingFormSlugMode,
  slug: string,
  slugTouched: boolean
): boolean {
  return (
    mode === 'create' && slugTouched && slug.trim().length > 0 && !slugify(slug)
  );
}
