import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import {
  buildListingSlug,
  deepPruneUndefined,
  sanitizeListingInput,
} from '@/app/lib/helpers/listing-admin-helpers';
import { locales } from '@/i18n/routing';

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

  const sanitized = sanitizeListingInput(payload);
  if (sanitized.title && !sanitized.title.en) {
    return NextResponse.json(
      { error: 'title.en is required when title is provided' },
      { status: 400 }
    );
  }

  if (sanitized.title?.en) {
    sanitized.slug = buildListingSlug(sanitized);
  }
  sanitized.updatedAt = new Date().toISOString();

  // Drop undefined keys recursively so partial PUT requests only update provided fields.
  const updatePayload = deepPruneUndefined(sanitized);

  const collection = await getListingsCollection();
  const result = await collection.findOneAndUpdate(
    { id },
    { $set: updatePayload },
    { returnDocument: 'after', projection: { _id: 0 } }
  );

  if (!result) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  const updatedSlug = (result as { slug: string }).slug;
  for (const locale of Object.keys(locales)) {
    revalidatePath(`/${locale}/property/${updatedSlug}`);
  }

  return NextResponse.json({ listing: result }, { status: 200 });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  const collection = await getListingsCollection();
  const deleted = await collection.findOneAndDelete(
    { id },
    { projection: { slug: 1, _id: 0 } }
  );

  if (!deleted) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  const deletedSlug = (deleted as { slug: string }).slug;
  for (const locale of Object.keys(locales)) {
    revalidatePath(`/${locale}/property/${deletedSlug}`);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
