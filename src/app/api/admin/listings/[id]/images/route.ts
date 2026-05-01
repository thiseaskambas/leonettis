import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import type { ListingImage } from '@/app/lib/definitions/listing.types';
import { uploadToSevalla } from '@/app/lib/helpers/sevalla-storage';

/** Align with presign route and admin client max upload size. */
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

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

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File exceeds maximum size' },
      { status: 400 }
    );
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

  let url: string;
  let key: string;

  const outputContentType =
    media.mediaType === 'image' && file.type !== 'image/svg+xml'
      ? 'image/webp'
      : media.contentType;

  if (media.mediaType === 'image' && file.type !== 'image/svg+xml') {
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    let webpBuffer: Buffer;
    let icoBuffer: Buffer | null = null;
    try {
      const { data, info } = await sharp(rawBuffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer({ resolveWithObject: true });
      webpBuffer = data;
      const icoWidth = Math.max(1, Math.round(info.width * 0.02));
      const icoHeight = Math.max(1, Math.round(info.height * 0.02));
      try {
        icoBuffer = await sharp(webpBuffer)
          .resize(icoWidth, icoHeight)
          .webp({ quality: 60 })
          .toBuffer();
      } catch (err) {
        console.warn('[ico] thumbnail generation failed:', err);
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid or unsupported image file' },
        { status: 400 }
      );
    }
    const timestamp = Date.now();
    const safeBase = sanitizeFilename(file.name).replace(/\.[^.]+$/, '');
    key = `listings/${id}/images/${timestamp}-${safeBase}.webp`;
    url = await uploadToSevalla(key, webpBuffer, 'image/webp');
    if (icoBuffer) {
      const icoKey = `listings/${id}/images/ico-${timestamp}-${safeBase}.webp`;
      try {
        await uploadToSevalla(icoKey, icoBuffer, 'image/webp');
      } catch (err) {
        console.warn('[ico] thumbnail upload failed:', err);
      }
    }
  } else {
    const safeName = sanitizeFilename(file.name);
    key = `listings/${id}/${media.mediaType}s/${Date.now()}-${safeName}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    url = await uploadToSevalla(key, fileBuffer, media.contentType);
  }

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
          contentType: outputContentType,
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
        contentType: outputContentType,
      },
    },
    { status: 200 }
  );
}
