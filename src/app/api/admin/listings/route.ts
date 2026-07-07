import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import type { Listing } from '@/app/lib/definitions/listing.types';
import {
  buildListingSlug,
  sanitizeListingInput,
} from '@/app/lib/helpers/listing-admin-helpers';
import { slugify } from '@/app/lib/helpers/slug-helpers';

function isDuplicateKeyError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as { code?: unknown }).code === 11000
  );
}

export async function GET(): Promise<NextResponse> {
  const collection = await getListingsCollection();
  const listings = await collection
    .find({}, { projection: { _id: 0 } })
    .sort({ publishedAt: -1 })
    .toArray();

  return NextResponse.json({ listings }, { status: 200 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const input = sanitizeListingInput(payload);
  if (
    !input.title?.en ||
    !input.listingType ||
    !input.propertyType ||
    !input.propertyTypes?.length
  ) {
    return NextResponse.json(
      {
        error: 'Missing required fields: title.en, listingType, propertyTypes',
      },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  let slug = buildListingSlug(input);

  if (input.slug !== undefined) {
    const trimmedSlug = input.slug.trim();
    if (trimmedSlug) {
      slug = slugify(trimmedSlug);
      if (!slug) {
        return NextResponse.json(
          {
            error:
              'slug must contain at least one URL-safe character after normalization',
          },
          { status: 400 }
        );
      }
    }
  }

  const listing: Listing = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    slug,
    address: input.address ?? {
      city: '',
      zipCode: '',
      country: '',
      coordinates: { lat: 0, lng: 0 },
    },
    listingType: input.listingType,
    category: input.category ?? ['residential'],
    propertyType: input.propertyType,
    propertyTypes: input.propertyTypes,
    price: input.price,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    squareMetersInterior: input.squareMetersInterior,
    squareMetersOutdoor: input.squareMetersOutdoor,
    squareMetersTotal: input.squareMetersTotal,
    images: input.images ?? [],
    mainImage: input.mainImage,
    videos: input.videos ?? [],
    features: input.features ?? [],
    furnishing: input.furnishing,
    amenities: input.amenities ?? [],
    suitableFor: input.suitableFor ?? [],
    view: input.view ?? [],
    publishedAt: now,
    updatedAt: now,
    status: input.status ?? 'active',
    isFeatured: input.isFeatured ?? false,
    tags: input.tags ?? [],
    favorite: input.favorite ?? false,
    urgent: input.urgent ?? false,
    condition: input.condition,
    yearBuilt: input.yearBuilt,
    energyRating: input.energyRating,
    yearRenovated: input.yearRenovated,
    availableNow: input.availableNow ?? false,
    availableUponRequest: input.availableUponRequest ?? false,
    availableFrom: input.availableFrom,
    availableTo: input.availableTo,
    leaseDuration: input.leaseDuration,
    leaseDurationUnit: input.leaseDurationUnit,
    leaseDurationType: input.leaseDurationType,
    antiparochi: input.antiparochi ?? null,
  };

  const collection = await getListingsCollection();
  try {
    await collection.insertOne(listing);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'slug already exists' },
        { status: 400 }
      );
    }

    throw error;
  }

  return NextResponse.json({ listing }, { status: 201 });
}
