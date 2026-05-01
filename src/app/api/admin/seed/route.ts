import { NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import { listingsData } from '@/app/lib/mock-data/listings-data';

export async function POST(): Promise<NextResponse> {
  const collection = await getListingsCollection();

  let inserted = 0;
  let skipped = 0;

  for (const listing of listingsData) {
    const exists = await collection.findOne(
      { id: listing.id },
      { projection: { id: 1 } }
    );

    if (exists) {
      skipped += 1;
      continue;
    }

    await collection.insertOne({
      ...listing,
      publishedAt: listing.publishedAt || new Date().toISOString(),
      updatedAt: listing.updatedAt || new Date().toISOString(),
    });
    inserted += 1;
  }

  return NextResponse.json({ inserted, skipped }, { status: 200 });
}
