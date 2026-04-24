import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import { deleteFromSevalla } from '@/app/lib/helpers/sevalla-storage';

interface DeleteImagePayload {
  listingId?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  mediaKey?: string;
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
  const mediaType = body.mediaType ?? 'image';
  const mediaUrl = (body.mediaUrl ?? body.imageUrl)?.trim();
  const mediaKey = (body.mediaKey ?? body.imageKey)?.trim();

  if (!listingId || !mediaUrl || !mediaKey) {
    return NextResponse.json(
      { error: 'listingId, mediaType, mediaUrl and mediaKey are required' },
      { status: 400 }
    );
  }

  const collection = await getListingsCollection();
  const listingQuery =
    mediaType === 'image'
      ? { id: listingId, 'images.url': mediaUrl }
      : {
          id: listingId,
          $or: [{ 'videos.url': mediaUrl }, { videos: mediaUrl }],
        };

  const listing = await collection.findOne(listingQuery, {
    projection: { id: 1 },
  });
  if (!listing) {
    return NextResponse.json(
      { error: 'Listing media not found for deletion' },
      { status: 404 }
    );
  }

  await deleteFromSevalla(mediaKey);

  if (mediaType === 'image') {
    await collection.updateOne(
      { id: listingId },
      { $pull: { images: { url: mediaUrl } } }
    );
  } else {
    await collection.updateOne(
      { id: listingId },
      { $pull: { videos: { url: mediaUrl } } }
    );
    await collection.updateOne(
      { id: listingId },
      { $pull: { videos: mediaUrl } }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: 'Deleted from Sevalla and removed media reference from listing',
    },
    { status: 200 }
  );
}
