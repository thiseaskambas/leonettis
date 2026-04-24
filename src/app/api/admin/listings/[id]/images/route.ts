import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import type { ListingImage } from '@/app/lib/definitions/listing.types';
import { uploadToSevalla } from '@/app/lib/helpers/sevalla-storage';

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '-').toLowerCase();
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  const collection = await getListingsCollection();
  const existing = await collection.findOne({ id }, { projection: { id: 1 } });
  if (!existing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  const safeName = sanitizeFilename(file.name);
  const key = `listings/${id}/${Date.now()}-${safeName}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToSevalla(key, fileBuffer, file.type || 'image/jpeg');

  const image: ListingImage = { url, name: file.name, key };
  await collection.updateOne({ id }, { $push: { images: image } });

  return NextResponse.json({ image }, { status: 200 });
}
