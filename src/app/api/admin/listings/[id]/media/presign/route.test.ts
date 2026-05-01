import { beforeEach, describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const createSevallaPresignedUploadUrlMock = vi.hoisted(() => vi.fn());
const getSevallaPublicUrlMock = vi.hoisted(() => vi.fn());

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    findOne,
  })),
}));

vi.mock('@/app/lib/helpers/sevalla-storage', () => ({
  createSevallaPresignedUploadUrl: createSevallaPresignedUploadUrlMock,
  getSevallaPublicUrl: getSevallaPublicUrlMock,
}));

import { POST } from './route';

describe('POST /api/admin/listings/[id]/media/presign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findOne.mockResolvedValue({ id: 'listing-1' });
    getSevallaPublicUrlMock.mockReturnValue(
      'https://leonettis-lwqcz.sevalla.storage'
    );
    createSevallaPresignedUploadUrlMock.mockResolvedValue(
      'https://upload.example.com/put/listings/listing-1/videos/file.mp4?signature=123'
    );
  });

  it('returns signed upload data for valid video payload', async () => {
    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/media/presign',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'clip.mp4',
          contentType: 'video/mp4',
          size: 1024,
        }),
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.uploadUrl).toContain('signature=123');
    expect(body.maxFileSizeBytes).toBe(500 * 1024 * 1024);
    expect(body.media.mediaType).toBe('video');
    expect(body.media.name).toBe('clip.mp4');
    expect(body.media.url).toMatch(
      /^https:\/\/leonettis-lwqcz\.sevalla\.storage\/listings\/listing-1\/videos\//
    );
    expect(createSevallaPresignedUploadUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringContaining('listings/listing-1/videos/'),
        contentType: 'video/mp4',
        contentLength: 1024,
      })
    );
  });

  it('returns signed upload data for valid image payload', async () => {
    createSevallaPresignedUploadUrlMock.mockResolvedValueOnce(
      'https://upload.example.com/put/listings/listing-1/images/photo.jpg?signature=456'
    );
    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/media/presign',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
          size: 2048,
        }),
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.uploadUrl).toContain('signature=456');
    expect(body.media.mediaType).toBe('image');
    expect(body.media.name).toBe('photo.jpg');
    expect(body.media.url).toMatch(
      /^https:\/\/leonettis-lwqcz\.sevalla\.storage\/listings\/listing-1\/images\//
    );
    expect(createSevallaPresignedUploadUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringContaining('listings/listing-1/images/'),
        contentType: 'image/jpeg',
        contentLength: 2048,
      })
    );
  });

  it('accepts a 12MB image payload for direct upload', async () => {
    createSevallaPresignedUploadUrlMock.mockResolvedValueOnce(
      'https://upload.example.com/put/listings/listing-1/images/large-photo.jpg?signature=789'
    );
    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/media/presign',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'large-photo.jpg',
          contentType: 'image/jpeg',
          size: 12 * 1024 * 1024,
        }),
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.media.mediaType).toBe('image');
    expect(createSevallaPresignedUploadUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringContaining('listings/listing-1/images/'),
        contentLength: 12 * 1024 * 1024,
      })
    );
  });

  it('rejects files larger than 500MB', async () => {
    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/media/presign',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'clip.mp4',
          contentType: 'video/mp4',
          size: 500 * 1024 * 1024 + 1,
        }),
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    expect(response.status).toBe(400);
    expect(createSevallaPresignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it('returns 404 when listing does not exist', async () => {
    findOne.mockResolvedValueOnce(null);

    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/media/presign',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'clip.mp4',
          contentType: 'video/mp4',
          size: 1024,
        }),
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });

    expect(response.status).toBe(404);
  });
});
