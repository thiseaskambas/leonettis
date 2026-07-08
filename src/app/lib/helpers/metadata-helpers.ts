import type { Metadata } from 'next';

import type { LocalizedListing } from '@/app/lib/definitions/listing.types';
import { formatPublicAddress } from '@/app/lib/helpers/listing-address-helpers';
import { getMediaUrl } from '@/app/lib/helpers/media-helpers';
import { getSiteUrl } from '@/app/lib/helpers/site-url';
import { type Locale, locales } from '@/i18n/routing';

export const SITE_NAME = "Leonetti's";
export const DEFAULT_LOCALE = 'en' satisfies Locale;
export const METADATA_DESCRIPTION_MAX_LENGTH = 160;

const DEFAULT_PREVIEW_IMAGE_PATH = '/logo-xl.png';
const DEFAULT_PREVIEW_IMAGE_WIDTH = 2480;
const DEFAULT_PREVIEW_IMAGE_HEIGHT = 1076;

export const HREFLANG_BY_LOCALE = {
  en: 'en',
  fr: 'fr',
  gr: 'el-GR',
  de: 'de',
  it: 'it',
} as const satisfies Record<Locale, string>;

export const OPEN_GRAPH_LOCALE_BY_LOCALE = {
  en: 'en_US',
  fr: 'fr_FR',
  gr: 'el_GR',
  de: 'de_DE',
  it: 'it_IT',
} as const satisfies Record<Locale, string>;

const localeCodes = Object.keys(locales) as Locale[];

export interface PreviewImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

function normalizeRoutePath(path: string): string {
  if (!path || path === '/') return '';
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildLocalizedUrl(
  siteUrl: string,
  locale: Locale,
  path: string
): string {
  return `${siteUrl}/${locale}${normalizeRoutePath(path)}`;
}

export function buildLanguageAlternates(
  siteUrl: string,
  path: string
): Record<string, string> {
  const languages = localeCodes.reduce<Record<string, string>>(
    (acc, locale) => {
      acc[HREFLANG_BY_LOCALE[locale]] = buildLocalizedUrl(
        siteUrl,
        locale,
        path
      );
      return acc;
    },
    {}
  );

  languages['x-default'] = buildLocalizedUrl(siteUrl, DEFAULT_LOCALE, path);
  return languages;
}

export function getOpenGraphLocale(locale: Locale): string {
  return OPEN_GRAPH_LOCALE_BY_LOCALE[locale];
}

export function getAlternateOpenGraphLocales(locale: Locale): string[] {
  return localeCodes
    .filter((candidate) => candidate !== locale)
    .map((candidate) => OPEN_GRAPH_LOCALE_BY_LOCALE[candidate]);
}

export function buildDefaultPreviewImage(
  siteUrl: string,
  alt = SITE_NAME
): PreviewImage {
  return {
    url: new URL(DEFAULT_PREVIEW_IMAGE_PATH, siteUrl).toString(),
    width: DEFAULT_PREVIEW_IMAGE_WIDTH,
    height: DEFAULT_PREVIEW_IMAGE_HEIGHT,
    alt,
  };
}

export function resolveMetadataImageUrl(
  value: string | undefined,
  siteUrl: string
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) {
    return null;
  }

  try {
    const absoluteUrl = new URL(getMediaUrl(trimmed), siteUrl);
    if (absoluteUrl.protocol !== 'http:' && absoluteUrl.protocol !== 'https:') {
      return null;
    }
    return absoluteUrl.toString();
  } catch {
    return null;
  }
}

export function getPropertyPreviewImage(
  listing: Pick<LocalizedListing, 'images' | 'mainImage' | 'title'>,
  siteUrl: string
): PreviewImage {
  const candidates = [
    listing.mainImage,
    ...(listing.images?.map((image) => image.url) ?? []),
  ];

  for (const candidate of candidates) {
    const url = resolveMetadataImageUrl(candidate, siteUrl);
    if (url) {
      return {
        url,
        alt: listing.title,
      };
    }
  }

  return buildDefaultPreviewImage(siteUrl, listing.title);
}

export function trimMetadataDescription(
  value: string,
  maxLength = METADATA_DESCRIPTION_MAX_LENGTH
): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const truncatedLength = Math.max(0, maxLength - 3);
  const lastSpace = normalized.lastIndexOf(' ', truncatedLength);
  const endIndex = lastSpace > 0 ? lastSpace : truncatedLength;
  return `${normalized.slice(0, endIndex).trimEnd()}...`;
}

export function buildPropertyDescription(
  listing: Pick<LocalizedListing, 'address' | 'description' | 'title'>
): string {
  const publicAddress = formatPublicAddress(listing.address);
  const fallback = [listing.title, publicAddress].filter(Boolean).join(' - ');

  return trimMetadataDescription(listing.description || fallback);
}

interface BuildSharedMetadataInput {
  locale: Locale;
  title: string;
  description: string;
  image?: PreviewImage;
  path?: string;
  siteUrl?: string;
}

export function buildSharedMetadata({
  locale,
  title,
  description,
  image,
  path,
  siteUrl = getSiteUrl(),
}: BuildSharedMetadataInput): Metadata {
  const previewImage = image ?? buildDefaultPreviewImage(siteUrl, title);

  return {
    metadataBase: new URL(siteUrl),
    description,
    ...(path != null
      ? {
          alternates: {
            canonical: buildLocalizedUrl(siteUrl, locale, path),
            languages: buildLanguageAlternates(siteUrl, path),
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      ...(path != null
        ? { url: buildLocalizedUrl(siteUrl, locale, path) }
        : {}),
      siteName: SITE_NAME,
      locale: getOpenGraphLocale(locale),
      alternateLocale: getAlternateOpenGraphLocales(locale),
      type: 'website',
      images: [previewImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImage.url],
    },
  };
}
