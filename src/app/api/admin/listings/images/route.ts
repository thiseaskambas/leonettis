import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import { deleteFromSevalla } from '@/app/lib/helpers/sevalla-storage';

function deriveIcoKey(mainKey: string): string {
  const lastSlash = mainKey.lastIndexOf('/');
  if (lastSlash === -1) return `ico-${mainKey}`;
  return `${mainKey.slice(0, lastSlash + 1)}ico-${mainKey.slice(lastSlash + 1)}`;
}

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
  const listing = await collection.findOne(
    { id: listingId },
    {
      projection: { id: 1, images: 1, videos: 1 },
    }
  );
  const legacyVideos = (listing as { videos?: unknown[] } | null)?.videos;
  const hasLegacyVideoReference =
    Array.isArray(legacyVideos) &&
    legacyVideos.some(
      (video): video is string => typeof video === 'string' && video === mediaUrl
    );
  const hasMediaReference =
    mediaType === 'image'
      ? listing?.images?.some((image) => image.url === mediaUrl)
      : listing?.videos?.some((video) => video.url === mediaUrl) ||
        hasLegacyVideoReference;

  if (!listing || !hasMediaReference) {
    return NextResponse.json(
      { error: 'Listing media not found for deletion' },
      { status: 404 }
    );
  }

  await deleteFromSevalla(mediaKey);

  if (mediaType === 'image') {
    try {
      await deleteFromSevalla(deriveIcoKey(mediaKey));
    } catch {
      // Legacy images may have no ico- companion; ignore.
    }
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
      { $pull: { videos: mediaUrl } } as never
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
