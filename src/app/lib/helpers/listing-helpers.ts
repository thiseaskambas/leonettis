import { Locale } from '@/i18n/routing';

import { getListingsCollection } from '../db/mongodb';
import { Listing, LocalizedListing } from '../definitions/listing.types';

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const collection = await getListingsCollection();
  const listing = await collection.findOne({ slug }, { projection: { _id: 0 } });
  if (!listing?.status) {
    return null;
  }

  return listing;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const collection = await getListingsCollection();
  return await collection.findOne({ id }, { projection: { _id: 0 } });
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
