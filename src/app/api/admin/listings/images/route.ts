import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import { deleteFromSevalla } from '@/app/lib/helpers/sevalla-storage';

interface DeleteImagePayload {
  listingId?: string;
  imageUrl?: string;
  imageKey?: string;
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  let body: DeleteImagePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const listingId = body.listingId?.trim();
  const imageUrl = body.imageUrl?.trim();
  const imageKey = body.imageKey?.trim();

  if (!listingId || !imageUrl || !imageKey) {
    return NextResponse.json(
      { error: 'listingId, imageUrl and imageKey are required' },
      { status: 400 }
    );
  }

  await deleteFromSevalla(imageKey);

  const collection = await getListingsCollection();
  await collection.updateOne(
    { id: listingId },
    { $pull: { images: { url: imageUrl } } }
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}
