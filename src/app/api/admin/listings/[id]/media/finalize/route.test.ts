import { beforeEach, describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const updateOne = vi.fn();

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    findOne,
    updateOne,
  })),
}));

import { POST } from './route';

describe('POST /api/admin/listings/[id]/media/finalize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findOne.mockResolvedValue({ id: 'listing-1' });
  });

  it('persists image metadata on listing', async () => {
    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/media/finalize',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://cdn.example.com/listings/listing-1/images/main.jpg',
          key: 'listings/listing-1/images/main.jpg',
          name: 'main.jpg',
          mediaType: 'image',
        }),
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.media.mediaType).toBe('image');
    expect(body.image).toBeDefined();
    expect(updateOne).toHaveBeenCalledWith(
      { id: 'listing-1' },
      {
        $push: {
          images: {
            url: 'https://cdn.example.com/listings/listing-1/images/main.jpg',
            key: 'listings/listing-1/images/main.jpg',
            name: 'main.jpg',
          },
        },
      }
    );
  });

  it('persists video metadata on listing', async () => {
    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/media/finalize',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://cdn.example.com/listings/listing-1/videos/clip.mp4',
          key: 'listings/listing-1/videos/clip.mp4',
          name: 'clip.mp4',
          mediaType: 'video',
        }),
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.media.mediaType).toBe('video');
    expect(updateOne).toHaveBeenCalledWith(
      { id: 'listing-1' },
      {
        $push: {
          videos: {
            url: 'https://cdn.example.com/listings/listing-1/videos/clip.mp4',
            key: 'listings/listing-1/videos/clip.mp4',
            name: 'clip.mp4',
          },
        },
      }
    );
  });

  it('rejects keys that do not match listing/media type', async () => {
    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/media/finalize',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://cdn.example.com/listings/listing-1/videos/clip.mp4',
          key: 'listings/listing-999/videos/clip.mp4',
          name: 'clip.mp4',
          mediaType: 'video',
        }),
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });

    expect(response.status).toBe(400);
    expect(updateOne).not.toHaveBeenCalled();
  });
});
