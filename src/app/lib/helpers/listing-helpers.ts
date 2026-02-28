import { Locale } from '@/i18n/routing';

import { Listing, LocalizedListing } from '../definitions/listing.types';
import { listingsData } from '../mock-data/listings-data';

export function getListingBySlug(slug: string): Listing | undefined {
  return listingsData.find((l) => l.slug === slug);
}

export function getLocalizedListing(
  listing: Listing,
  locale: Locale
): LocalizedListing {
  return {
    ...listing,
    title: listing.title[locale] ?? listing.title.en,
    description: listing.description?.[locale] ?? listing.description?.en,
  };
}
