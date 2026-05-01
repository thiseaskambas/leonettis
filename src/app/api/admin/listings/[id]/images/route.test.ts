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

/** Minimal valid 1×1 PNG (Sharp accepts this in tests). */
const MINIMAL_PNG = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  )
);

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
      new File([MINIMAL_PNG], 'image.png', {
        type: 'image/png',
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
    expect(body.media.contentType).toBe('image/webp');
    expect(body.image).toBeDefined();
    expect(uploadToSevallaMock).toHaveBeenCalledTimes(2);
    const mainKey = uploadToSevallaMock.mock.calls[0][0] as string;
    const icoKey = uploadToSevallaMock.mock.calls[1][0] as string;
    const tsMatch = mainKey.match(/(\d+)-image\.webp$/);
    expect(tsMatch).not.toBeNull();
    expect(mainKey).toBe(
      `listings/listing-1/images/${tsMatch![1]}-image.webp`
    );
    expect(icoKey).toBe(
      `listings/listing-1/images/ico-${tsMatch![1]}-image.webp`
    );
    const mainBuf = uploadToSevallaMock.mock.calls[0][1] as Buffer;
    const icoBuf = uploadToSevallaMock.mock.calls[1][1] as Buffer;
    expect(icoBuf.length).toBeLessThan(mainBuf.length);
    expect(uploadToSevallaMock.mock.calls[0][2]).toBe('image/webp');
    expect(uploadToSevallaMock.mock.calls[1][2]).toBe('image/webp');
    expect(updateOne).toHaveBeenCalledWith(
      { id: 'listing-1' },
      {
        $push: {
          images: expect.objectContaining({
            url: expect.any(String),
            name: 'image.png',
            key: expect.stringMatching(
              /listings\/listing-1\/images\/\d+-image\.webp$/
            ),
          }),
        },
      }
    );
  });

  it('returns 400 when image bytes are not a valid image', async () => {
    const formData = new FormData();
    formData.set(
      'file',
      new File([new Uint8Array([1, 2, 3])], 'broken.jpg', {
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

    expect(response.status).toBe(400);
    expect(uploadToSevallaMock).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('returns 400 when file exceeds max size', async () => {
    const big = new Uint8Array(1);
    const file = new File([big], 'huge.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 500 * 1024 * 1024 + 1 });

    const formData = new FormData();
    formData.set('file', file);

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
