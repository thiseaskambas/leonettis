import { beforeEach, describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const updateOne = vi.fn();
const uploadToSevallaMock = vi.hoisted(() => vi.fn());

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    findOne,
    updateOne,
  })),
}));

vi.mock('@/app/lib/helpers/sevalla-storage', () => ({
  uploadToSevalla: uploadToSevallaMock,
}));

import { POST } from './route';

describe('POST /api/admin/listings/[id]/images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findOne.mockResolvedValue({ id: 'listing-1' });
    uploadToSevallaMock.mockResolvedValue(
      'https://cdn.example.com/listings/listing-1/images/image.jpg'
    );
  });

  it('uploads image files and stores image metadata', async () => {
    const formData = new FormData();
    formData.set(
      'file',
      new File([new Uint8Array([1, 2, 3])], 'image.jpg', {
        type: 'image/jpeg',
      })
    );

    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/images',
      {
        method: 'POST',
        body: formData,
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.media.mediaType).toBe('image');
    expect(body.media.contentType).toBe('image/jpeg');
    expect(body.image).toBeDefined();
    expect(updateOne).toHaveBeenCalledWith(
      { id: 'listing-1' },
      {
        $push: {
          images: expect.objectContaining({
            url: expect.any(String),
            name: 'image.jpg',
            key: expect.stringContaining('listings/listing-1/images/'),
          }),
        },
      }
    );
  });

  it('uploads video files and appends video metadata', async () => {
    uploadToSevallaMock.mockResolvedValueOnce(
      'https://cdn.example.com/listings/listing-1/videos/clip.mp4'
    );
    const formData = new FormData();
    formData.set(
      'file',
      new File([new Uint8Array([1, 2, 3])], 'clip.mp4', {
        type: 'video/mp4',
      })
    );

    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/images',
      {
        method: 'POST',
        body: formData,
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.media.mediaType).toBe('video');
    expect(body.media.contentType).toBe('video/mp4');
    expect(updateOne).toHaveBeenCalledWith(
      { id: 'listing-1' },
      {
        $push: {
          videos: expect.objectContaining({
            url: 'https://cdn.example.com/listings/listing-1/videos/clip.mp4',
            name: 'clip.mp4',
            key: expect.stringContaining('listings/listing-1/videos/'),
            contentType: 'video/mp4',
          }),
        },
      }
    );
  });

  it('falls back to filename extension when File.type is missing', async () => {
    uploadToSevallaMock.mockResolvedValueOnce(
      'https://cdn.example.com/listings/listing-1/videos/clip.webm'
    );
    const formData = new FormData();
    formData.set('file', new File([new Uint8Array([1, 2, 3])], 'clip.webm'));

    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/images',
      {
        method: 'POST',
        body: formData,
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.media.mediaType).toBe('video');
    expect(body.media.contentType).toBe('video/webm');
    expect(uploadToSevallaMock).toHaveBeenCalledWith(
      expect.stringContaining('/videos/'),
      expect.any(Buffer),
      'video/webm'
    );
  });

  it('returns 400 for unsupported files', async () => {
    const formData = new FormData();
    formData.set(
      'file',
      new File([new Uint8Array([1, 2, 3])], 'notes.pdf', {
        type: 'application/pdf',
      })
    );

    const request = new Request(
      'http://localhost/api/admin/listings/listing-1/images',
      {
        method: 'POST',
        body: formData,
      }
    );

    const response = await POST(request as never, {
      params: Promise.resolve({ id: 'listing-1' }),
    });

    expect(response.status).toBe(400);
    expect(uploadToSevallaMock).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });
});
