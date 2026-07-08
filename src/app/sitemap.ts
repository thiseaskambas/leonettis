import type { MetadataRoute } from 'next';

import type { ListingVideo } from '@/app/lib/definitions/listing.types';
import { getMediaUrl } from '@/app/lib/helpers/media-helpers';
import {
  getSitemapListings,
  type SitemapListing,
} from '@/app/lib/services/listings-service';
import { type Locale, locales } from '@/i18n/routing';

type SitemapEntry = MetadataRoute.Sitemap[number];
type SitemapLanguages = NonNullable<
  NonNullable<SitemapEntry['alternates']>['languages']
>;
type SitemapVideo = NonNullable<SitemapEntry['videos']>[number];

export const STATIC_SITEMAP_PATHS = [
  '',
  '/buy',
  '/rent',
  '/about',
  '/contact',
  '/list-a-property',
] as const;

const DEFAULT_LOCALE = 'en' satisfies Locale;

const HREFLANG_BY_LOCALE = {
  en: 'en',
  fr: 'fr',
  gr: 'el-GR',
  de: 'de',
  it: 'it',
} as const satisfies Record<Locale, string>;

const localeCodes = Object.keys(locales) as Locale[];

function normalizeRoutePath(path: string): string {
  if (!path || path === '/') return '';
  return path.startsWith('/') ? path : `/${path}`;
}

export function getRequiredSiteUrl(
  rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
): string {
  const trimmed = rawSiteUrl?.trim();

  if (!trimmed) {
    throw new Error('NEXT_PUBLIC_SITE_URL is not configured');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL');
  }

  if (parsed.search || parsed.hash) {
    throw new Error('NEXT_PUBLIC_SITE_URL must not include query or hash');
  }

  return trimmed.replace(/\/+$/, '');
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
): SitemapLanguages {
  const languages = localeCodes.reduce<SitemapLanguages>((acc, locale) => {
    acc[HREFLANG_BY_LOCALE[locale]] = buildLocalizedUrl(siteUrl, locale, path);
    return acc;
  }, {});

  languages['x-default'] = buildLocalizedUrl(siteUrl, DEFAULT_LOCALE, path);
  return languages;
}

export function resolveAbsoluteHttpUrl(
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

function getLocalizedText(
  values: SitemapListing['title'] | SitemapListing['description'] | undefined,
  locale: Locale
): string | undefined {
  return values?.[locale] ?? values?.[DEFAULT_LOCALE];
}

export function getListingImages(
  listing: SitemapListing,
  siteUrl: string
): string[] {
  return Array.from(
    new Set(
      (listing.images ?? [])
        .map((image) => resolveAbsoluteHttpUrl(image.url, siteUrl))
        .filter((url): url is string => Boolean(url))
    )
  );
}

function buildVideoEntry(
  video: ListingVideo,
  thumbnailUrl: string,
  listing: SitemapListing,
  locale: Locale,
  siteUrl: string
): SitemapVideo | null {
  const contentUrl = resolveAbsoluteHttpUrl(video.url, siteUrl);
  if (!contentUrl) return null;

  const title = getLocalizedText(listing.title, locale);
  if (!title) return null;

  return {
    title,
    description: getLocalizedText(listing.description, locale) ?? title,
    thumbnail_loc: thumbnailUrl,
    content_loc: contentUrl,
  };
}

export function getListingVideos(
  listing: SitemapListing,
  locale: Locale,
  siteUrl: string,
  thumbnailUrl: string | undefined
): SitemapVideo[] {
  if (!thumbnailUrl) return [];

  return (listing.videos ?? [])
    .map((video) =>
      buildVideoEntry(video, thumbnailUrl, listing, locale, siteUrl)
    )
    .filter((video): video is SitemapVideo => Boolean(video));
}

export function buildStaticSitemapEntries(
  siteUrl: string
): MetadataRoute.Sitemap {
  return STATIC_SITEMAP_PATHS.flatMap((path) =>
    localeCodes.map((locale) => ({
      url: buildLocalizedUrl(siteUrl, locale, path),
      alternates: {
        languages: buildLanguageAlternates(siteUrl, path),
      },
    }))
  );
}

export function buildPropertySitemapEntries(
  siteUrl: string,
  listings: SitemapListing[]
): MetadataRoute.Sitemap {
  return listings.flatMap((listing) => {
    const path = `/property/${listing.slug}`;
    const lastModified = listing.updatedAt || listing.publishedAt || undefined;
    const images = getListingImages(listing, siteUrl);
    const thumbnailUrl = images[0];

    return localeCodes.map((locale) => {
      const videos = getListingVideos(listing, locale, siteUrl, thumbnailUrl);

      return {
        url: buildLocalizedUrl(siteUrl, locale, path),
        lastModified,
        alternates: {
          languages: buildLanguageAlternates(siteUrl, path),
        },
        ...(images.length ? { images } : {}),
        ...(videos.length ? { videos } : {}),
      };
    });
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getRequiredSiteUrl();
  const listings = await getSitemapListings();

  return [
    ...buildStaticSitemapEntries(siteUrl),
    ...buildPropertySitemapEntries(siteUrl, listings),
  ];
}
