import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import type {
  ListingImage,
  ListingVideo,
} from '@/app/lib/definitions/listing.types';

type MediaType = 'image' | 'video';

interface FinalizeRequestBody {
  url?: string;
  key?: string;
  name?: string;
  mediaType?: MediaType;
}

function isValidMediaType(value: unknown): value is MediaType {
  return value === 'image' || value === 'video';
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  let body: FinalizeRequestBody;
  try {
    body = (await request.json()) as FinalizeRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const url = body.url?.trim();
  const key = body.key?.trim();
  const name = body.name?.trim();
  const mediaType = body.mediaType;

  if (!url || !key || !name || !isValidMediaType(mediaType)) {
    return NextResponse.json(
      { error: 'url, key, name and mediaType are required' },
      { status: 400 }
    );
  }

  if (!key.startsWith(`listings/${id}/${mediaType}s/`)) {
    return NextResponse.json(
      { error: 'Media key does not match listing or media type' },
      { status: 400 }
    );
  }

  const collection = await getListingsCollection();
  const existing = await collection.findOne({ id }, { projection: { id: 1 } });
  if (!existing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  if (mediaType === 'image') {
    const image: ListingImage = { url, key, name };
    await collection.updateOne({ id }, { $push: { images: image } });

    return NextResponse.json(
      {
        media: {
          url,
          key,
          name,
          mediaType,
        },
        image,
      },
      { status: 200 }
    );
  }

  const video: ListingVideo = { url, key, name };
  await collection.updateOne({ id }, { $push: { videos: video } });

  return NextResponse.json(
    {
      media: {
        url,
        key,
        name,
        mediaType,
      },
    },
    { status: 200 }
  );
}
