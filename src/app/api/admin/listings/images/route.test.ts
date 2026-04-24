import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateOne = vi.fn();
const findOne = vi.fn();
const deleteFromSevallaMock = vi.hoisted(() => vi.fn());

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    findOne,
    updateOne,
  })),
}));

vi.mock('@/app/lib/helpers/sevalla-storage', () => ({
  deleteFromSevalla: deleteFromSevallaMock,
}));

import { DELETE } from './route';

describe('DELETE /api/admin/listings/images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findOne.mockResolvedValue({ id: 'abc' });
  });

  it('removes image entry and storage object', async () => {
    const request = new Request('http://localhost/api/admin/listings/images', {
      method: 'DELETE',
      body: JSON.stringify({
        listingId: 'abc',
        mediaType: 'image',
        mediaUrl: 'https://img/x.jpg',
        mediaKey: 'listings/abc/x.jpg',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await DELETE(request as never);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(deleteFromSevallaMock).toHaveBeenCalledWith('listings/abc/x.jpg');
    expect(updateOne).toHaveBeenCalledWith(
      { id: 'abc' },
      { $pull: { images: { url: 'https://img/x.jpg' } } }
    );
  });

  it('removes video entry and storage object', async () => {
    const request = new Request('http://localhost/api/admin/listings/images', {
      method: 'DELETE',
      body: JSON.stringify({
        listingId: 'abc',
        mediaType: 'video',
        mediaUrl: 'https://cdn.example.com/listings/abc/videos/x.mp4',
        mediaKey: 'listings/abc/videos/x.mp4',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await DELETE(request as never);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(deleteFromSevallaMock).toHaveBeenCalledWith(
      'listings/abc/videos/x.mp4'
    );
    expect(updateOne).toHaveBeenNthCalledWith(
      1,
      { id: 'abc' },
      { $pull: { videos: { url: 'https://cdn.example.com/listings/abc/videos/x.mp4' } } }
    );
    expect(updateOne).toHaveBeenNthCalledWith(
      2,
      { id: 'abc' },
      { $pull: { videos: 'https://cdn.example.com/listings/abc/videos/x.mp4' } }
    );
  });

  it('returns 404 when listing image does not exist', async () => {
    findOne.mockResolvedValueOnce(null);
    const request = new Request('http://localhost/api/admin/listings/images', {
      method: 'DELETE',
      body: JSON.stringify({
        listingId: 'abc',
        mediaType: 'image',
        mediaUrl: 'https://img/x.jpg',
        mediaKey: 'listings/abc/x.jpg',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await DELETE(request as never);
    expect(response.status).toBe(404);
    expect(deleteFromSevallaMock).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });
});
