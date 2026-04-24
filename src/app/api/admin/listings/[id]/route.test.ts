import { beforeEach, describe, expect, it, vi } from 'vitest';

const deleteOne = vi.fn();
const findOne = vi.fn();
const findOneAndUpdate = vi.fn();

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    deleteOne,
    findOne,
    findOneAndUpdate,
  })),
}));

import { DELETE, GET, PUT } from './route';

describe('/api/admin/listings/[id] route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when listing is missing', async () => {
    findOne.mockResolvedValueOnce(null);

    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'missing' }),
    });
    expect(response.status).toBe(404);
  });

  it('deletes listing by id', async () => {
    deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    const response = await DELETE({} as never, {
      params: Promise.resolve({ id: '1' }),
    });
    expect(response.status).toBe(200);
  });

  it('persists explicit empty arrays in PUT updates', async () => {
    findOneAndUpdate.mockResolvedValueOnce({
      id: '1',
      tags: [],
      features: [],
      amenities: [],
      view: [],
      suitableFor: [],
      videos: [],
    });

    const request = new Request('http://localhost/api/admin/listings/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tags: [],
        features: [],
        amenities: [],
        view: [],
        suitableFor: [],
        videos: [],
      }),
    });

    const response = await PUT(request as never, {
      params: Promise.resolve({ id: '1' }),
    });

    expect(response.status).toBe(200);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { id: '1' },
      {
        $set: expect.objectContaining({
          tags: [],
          features: [],
          amenities: [],
          view: [],
          suitableFor: [],
          videos: [],
          updatedAt: expect.any(String),
        }),
      },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
  });

  it('preserves image key metadata in PUT updates', async () => {
    findOneAndUpdate.mockResolvedValueOnce({
      id: '1',
      images: [
        {
          url: 'https://cdn.example.com/listings/1/main.jpg',
          name: 'main.jpg',
          key: 'listings/1/main.jpg',
        },
      ],
    });

    const request = new Request('http://localhost/api/admin/listings/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: [
          {
            url: 'https://cdn.example.com/listings/1/main.jpg',
            name: 'main.jpg',
            key: 'listings/1/main.jpg',
          },
        ],
      }),
    });

    const response = await PUT(request as never, {
      params: Promise.resolve({ id: '1' }),
    });

    expect(response.status).toBe(200);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { id: '1' },
      {
        $set: expect.objectContaining({
          images: [
            {
              url: 'https://cdn.example.com/listings/1/main.jpg',
              name: 'main.jpg',
              key: 'listings/1/main.jpg',
            },
          ],
          updatedAt: expect.any(String),
        }),
      },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
  });
});
