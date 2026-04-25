import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import type { Listing } from '@/app/lib/definitions/listing.types';
import {
  buildListingSlug,
  sanitizeListingInput,
} from '@/app/lib/helpers/listing-admin-helpers';

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
  if (!input.title?.en || !input.listingType || !input.propertyType) {
    return NextResponse.json(
      {
        error: 'Missing required fields: title.en, listingType, propertyType',
      },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const listing: Listing = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    slug: buildListingSlug(input),
    address: input.address ?? {
      city: '',
      zipCode: '',
      country: '',
      coordinates: { lat: 0, lng: 0 },
    },
    listingType: input.listingType,
    category: input.category ?? ['residential'],
    propertyType: input.propertyType,
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
  };

  const collection = await getListingsCollection();
  await collection.insertOne(listing);

  return NextResponse.json({ listing }, { status: 201 });
}
