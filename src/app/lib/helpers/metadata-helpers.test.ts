import { afterEach, describe, expect, it } from 'vitest';

import type { LocalizedListing } from '@/app/lib/definitions/listing.types';

import {
  buildLanguageAlternates,
  buildLocalizedUrl,
  buildPropertyDescription,
  buildSharedMetadata,
  getOpenGraphLocale,
  getPropertyPreviewImage,
  trimMetadataDescription,
} from './metadata-helpers';

const siteUrl = 'https://www.leonettis.com';
const originalMediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

afterEach(() => {
  if (originalMediaBaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    return;
  }

  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = originalMediaBaseUrl;
});

function createListing(
  overrides: Partial<LocalizedListing> = {}
): LocalizedListing {
  return {
    id: 'listing-1',
    slug: 'villa-paros',
    title: 'Villa in Paros',
    description: 'A calm villa near the water.',
    address: {
      city: 'Paros',
      region: 'Cyclades',
      state: 'South Aegean',
      zipCode: '84400',
      country: 'Greece',
    },
    listingType: 'buy',
    category: ['residential'],
    propertyType: 'house',
    images: [],
    publishedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tags: [],
    ...overrides,
  };
}

describe('metadata helpers', () => {
  it('builds localized canonical URLs', () => {
    expect(buildLocalizedUrl(siteUrl, 'en', '')).toBe(
      'https://www.leonettis.com/en'
    );
    expect(buildLocalizedUrl(siteUrl, 'fr', '/buy')).toBe(
      'https://www.leonettis.com/fr/buy'
    );
    expect(buildLocalizedUrl(siteUrl, 'de', 'rent')).toBe(
      'https://www.leonettis.com/de/rent'
    );
  });

  it('builds hreflang alternates for all locales with Greek mapped to el-GR', () => {
    expect(buildLanguageAlternates(siteUrl, '/buy')).toEqual({
      en: 'https://www.leonettis.com/en/buy',
      fr: 'https://www.leonettis.com/fr/buy',
      'el-GR': 'https://www.leonettis.com/gr/buy',
      de: 'https://www.leonettis.com/de/buy',
      it: 'https://www.leonettis.com/it/buy',
      'x-default': 'https://www.leonettis.com/en/buy',
    });
  });

  it('uses Open Graph locale tags for route locales', () => {
    expect(getOpenGraphLocale('gr')).toBe('el_GR');
    expect(getOpenGraphLocale('fr')).toBe('fr_FR');
  });

  it('canonicalizes buy and rent metadata to base paths without query params', () => {
    const buyMetadata = buildSharedMetadata({
      locale: 'en',
      path: '/buy',
      title: 'Properties for sale',
      description: 'Find properties for sale.',
      siteUrl,
    });

    const rentMetadata = buildSharedMetadata({
      locale: 'fr',
      path: '/rent',
      title: 'Properties for rent',
      description: 'Find properties for rent.',
      siteUrl,
    });

    expect(buyMetadata.alternates?.canonical).toBe(
      'https://www.leonettis.com/en/buy'
    );
    expect(rentMetadata.alternates?.canonical).toBe(
      'https://www.leonettis.com/fr/rent'
    );
  });

  it('trims long metadata descriptions at word boundaries', () => {
    const description = trimMetadataDescription('A '.repeat(120), 40);

    expect(description.length).toBeLessThanOrEqual(40);
    expect(description.endsWith('...')).toBe(true);
    expect(description).not.toContain(' ...');
  });

  it('uses listing description first and falls back to title plus address', () => {
    expect(
      buildPropertyDescription(
        createListing({ description: 'A distinctive waterfront home.' })
      )
    ).toBe('A distinctive waterfront home.');

    expect(
      buildPropertyDescription(createListing({ description: undefined }))
    ).toBe('Villa in Paros - Paros, Cyclades, South Aegean');
  });

  it('chooses property preview images from main image, first image, then logo', () => {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL = 'https://cdn.example.com/';

    expect(
      getPropertyPreviewImage(
        createListing({
          mainImage: 'listings/1/main.jpg',
          images: [{ url: 'listings/1/first.jpg', name: 'first.jpg' }],
        }),
        siteUrl
      ).url
    ).toBe('https://cdn.example.com/listings/1/main.jpg');

    expect(
      getPropertyPreviewImage(
        createListing({
          mainImage: '',
          images: [{ url: 'listings/1/first.jpg', name: 'first.jpg' }],
        }),
        siteUrl
      ).url
    ).toBe('https://cdn.example.com/listings/1/first.jpg');

    expect(
      getPropertyPreviewImage(
        createListing({
          mainImage: '',
          images: [],
        }),
        siteUrl
      ).url
    ).toBe('https://www.leonettis.com/logo-xl.png');
  });
});
