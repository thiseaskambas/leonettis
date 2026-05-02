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

  it('passes predefined and custom array values in PUT updates', async () => {
    findOneAndUpdate.mockResolvedValueOnce({
      id: '1',
      features: ['garden', 'Roof Deck'],
      amenities: ['parking', 'Private Dock'],
      view: ['sea', 'Sunset Panorama'],
      suitableFor: ['family', 'Digital Nomads'],
    });

    const request = new Request('http://localhost/api/admin/listings/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        features: ['garden', 'Roof Deck'],
        amenities: ['parking', 'Private Dock'],
        view: ['sea', 'Sunset Panorama'],
        suitableFor: ['family', 'Digital Nomads'],
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
          features: ['garden', 'Roof Deck'],
          amenities: ['parking', 'Private Dock'],
          view: ['sea', 'Sunset Panorama'],
          suitableFor: ['family', 'Digital Nomads'],
          updatedAt: expect.any(String),
        }),
      },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
  });

  it('persists reordered images with mainImage in PUT updates', async () => {
    findOneAndUpdate.mockResolvedValueOnce({
      id: '1',
      mainImage: 'https://cdn.example.com/listings/1/second.jpg',
      images: [
        {
          url: 'https://cdn.example.com/listings/1/second.jpg',
          name: 'second.jpg',
          key: 'listings/1/second.jpg',
        },
        {
          url: 'https://cdn.example.com/listings/1/first.jpg',
          name: 'first.jpg',
          key: 'listings/1/first.jpg',
        },
      ],
    });

    const request = new Request('http://localhost/api/admin/listings/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mainImage: 'https://cdn.example.com/listings/1/second.jpg',
        images: [
          {
            url: 'https://cdn.example.com/listings/1/second.jpg',
            name: 'second.jpg',
            key: 'listings/1/second.jpg',
          },
          {
            url: 'https://cdn.example.com/listings/1/first.jpg',
            name: 'first.jpg',
            key: 'listings/1/first.jpg',
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
          mainImage: 'https://cdn.example.com/listings/1/second.jpg',
          images: [
            {
              url: 'https://cdn.example.com/listings/1/second.jpg',
              name: 'second.jpg',
              key: 'listings/1/second.jpg',
            },
            {
              url: 'https://cdn.example.com/listings/1/first.jpg',
              name: 'first.jpg',
              key: 'listings/1/first.jpg',
            },
          ],
          updatedAt: expect.any(String),
        }),
      },
      { returnDocument: 'after', projection: { _id: 0 } }
    );

    const updateDocument = findOneAndUpdate.mock.calls.at(-1)?.[1] as {
      $set: Record<string, unknown>;
    };
    expect(updateDocument.$set).not.toHaveProperty('title');
    expect(updateDocument.$set).not.toHaveProperty('description');
    expect(updateDocument.$set).not.toHaveProperty('address');
  });

  it('deep-prunes undefined keys from nested objects in PUT updates', async () => {
    findOneAndUpdate.mockResolvedValueOnce({
      id: '1',
      address: {
        streetName: '',
        city: 'Paros',
        zipCode: '',
        country: '',
        coordinates: { lat: 1, lng: 2 },
      },
    });

    const request = new Request('http://localhost/api/admin/listings/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: {
          city: 'Paros',
          coordinates: { lat: 1, lng: 2 },
        },
      }),
    });

    const response = await PUT(request as never, {
      params: Promise.resolve({ id: '1' }),
    });

    expect(response.status).toBe(200);
    const updateDocument = findOneAndUpdate.mock.calls.at(-1)?.[1] as {
      $set: Record<string, unknown>;
    };
    expect(updateDocument.$set).toHaveProperty('address');
    expect(updateDocument.$set.address).toEqual({
      streetName: '',
      city: 'Paros',
      zipCode: '',
      country: '',
      coordinates: { lat: 1, lng: 2 },
    });
    expect(updateDocument.$set.address).not.toHaveProperty('streetNumber');
    expect(updateDocument.$set.address).not.toHaveProperty('state');
    expect(updateDocument.$set.address).not.toHaveProperty('region');
    expect(updateDocument.$set.address).not.toHaveProperty('displayAddress');
  });

  it('preserves video metadata in PUT updates', async () => {
    findOneAndUpdate.mockResolvedValueOnce({
      id: '1',
      videos: [
        {
          url: 'https://cdn.example.com/listings/1/video.mp4',
          name: 'video.mp4',
          key: 'listings/1/videos/video.mp4',
        },
      ],
    });

    const request = new Request('http://localhost/api/admin/listings/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videos: [
          {
            url: 'https://cdn.example.com/listings/1/video.mp4',
            name: 'video.mp4',
            key: 'listings/1/videos/video.mp4',
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
          videos: [
            {
              url: 'https://cdn.example.com/listings/1/video.mp4',
              name: 'video.mp4',
              key: 'listings/1/videos/video.mp4',
            },
          ],
          updatedAt: expect.any(String),
        }),
      },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
  });
});
