import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import type {
  ListingImage,
} from '@/app/lib/definitions/listing.types';
import { uploadToSevalla } from '@/app/lib/helpers/sevalla-storage';

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '-').toLowerCase();
}

type MediaType = 'image' | 'video';

const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  ogv: 'video/ogg',
  m4v: 'video/x-m4v',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
};

function resolveContentTypeFromExtension(filename: string): string | null {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const extension = filename.slice(dotIndex + 1).toLowerCase();
  return EXTENSION_TO_CONTENT_TYPE[extension] ?? null;
}

function resolveMediaTypeAndContentType(file: File): {
  mediaType: MediaType;
  contentType: string;
} | null {
  const normalizedType = file.type.trim().toLowerCase();
  if (normalizedType.startsWith('image/')) {
    return { mediaType: 'image', contentType: normalizedType };
  }
  if (normalizedType.startsWith('video/')) {
    return { mediaType: 'video', contentType: normalizedType };
  }

  const inferredContentType = resolveContentTypeFromExtension(file.name);
  if (!inferredContentType) return null;

  if (inferredContentType.startsWith('image/')) {
    return { mediaType: 'image', contentType: inferredContentType };
  }
  if (inferredContentType.startsWith('video/')) {
    return { mediaType: 'video', contentType: inferredContentType };
  }

  return null;
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

  const media = resolveMediaTypeAndContentType(file);
  if (!media) {
    return NextResponse.json(
      { error: 'Only image and video files are supported' },
      { status: 400 }
    );
  }

  const collection = await getListingsCollection();
  const existing = await collection.findOne({ id }, { projection: { id: 1 } });
  if (!existing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  const safeName = sanitizeFilename(file.name);
  const key = `listings/${id}/${media.mediaType}s/${Date.now()}-${safeName}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToSevalla(key, fileBuffer, media.contentType);

  if (media.mediaType === 'image') {
    const image: ListingImage = { url, name: file.name, key };
    await collection.updateOne({ id }, { $push: { images: image } });

    return NextResponse.json(
      {
        media: {
          url,
          name: file.name,
          key,
          mediaType: media.mediaType,
          contentType: media.contentType,
        },
        image,
      },
      { status: 200 }
    );
  }

  const video = { url, name: file.name, key, contentType: media.contentType };
  await collection.updateOne({ id }, { $push: { videos: video } });

  return NextResponse.json(
    {
      media: {
        url,
        name: file.name,
        key,
        mediaType: media.mediaType,
        contentType: media.contentType,
      },
    },
    { status: 200 }
  );
}
