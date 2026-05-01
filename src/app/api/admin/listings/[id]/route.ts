import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import {
  buildListingSlug,
  sanitizeListingInput,
} from '@/app/lib/helpers/listing-admin-helpers';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  const collection = await getListingsCollection();
  const listing = await collection.findOne({ id }, { projection: { _id: 0 } });

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  return NextResponse.json({ listing }, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updatePayload = sanitizeListingInput(payload);
  if (updatePayload.title && !updatePayload.title.en) {
    return NextResponse.json(
      { error: 'title.en is required when title is provided' },
      { status: 400 }
    );
  }

  if (updatePayload.title?.en) {
    updatePayload.slug = buildListingSlug(updatePayload);
  }
  updatePayload.updatedAt = new Date().toISOString();

  const collection = await getListingsCollection();
  const result = await collection.findOneAndUpdate(
    { id },
    { $set: updatePayload },
    { returnDocument: 'after', projection: { _id: 0 } }
  );

  if (!result) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  return NextResponse.json({ listing: result }, { status: 200 });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  const collection = await getListingsCollection();
  const result = await collection.deleteOne({ id });

  if (!result.deletedCount) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
