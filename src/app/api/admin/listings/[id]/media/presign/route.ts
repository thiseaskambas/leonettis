import { NextRequest, NextResponse } from 'next/server';

import { getListingsCollection } from '@/app/lib/db/mongodb';
import {
  createSevallaPresignedUploadUrl,
  getSevallaPublicUrl,
} from '@/app/lib/helpers/sevalla-storage';

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
const PRESIGNED_UPLOAD_TTL_SECONDS = 15 * 60;

type MediaType = 'image' | 'video';

interface PresignRequestBody {
  filename?: string;
  contentType?: string;
  size?: number;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '-').toLowerCase();
}

function resolveMediaType(contentType: string): MediaType | null {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  return null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  let body: PresignRequestBody;
  try {
    body = (await request.json()) as PresignRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const filename = body.filename?.trim();
  const contentType = body.contentType?.trim() ?? '';
  const size = body.size;

  if (!filename || !contentType || typeof size !== 'number') {
    return NextResponse.json(
      { error: 'filename, contentType and size are required' },
      { status: 400 }
    );
  }

  if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File size must be between 1 byte and ${MAX_FILE_SIZE_BYTES}` },
      { status: 400 }
    );
  }

  const mediaType = resolveMediaType(contentType);
  if (!mediaType) {
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

  const safeName = sanitizeFilename(filename);
  const key = `listings/${id}/${mediaType}s/${Date.now()}-${safeName}`;

  try {
    const uploadUrl = await createSevallaPresignedUploadUrl({
      key,
      contentType,
      contentLength: size,
      expiresInSeconds: PRESIGNED_UPLOAD_TTL_SECONDS,
    });
    const mediaUrl = `${getSevallaPublicUrl()}/${key}`;

    return NextResponse.json(
      {
        uploadUrl,
        maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
        expiresInSeconds: PRESIGNED_UPLOAD_TTL_SECONDS,
        media: {
          url: mediaUrl,
          name: filename,
          key,
          mediaType,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}
