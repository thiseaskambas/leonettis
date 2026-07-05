import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertOne = vi.fn();
const sort = vi.fn(() => ({ toArray: vi.fn(async () => []) }));
const find = vi.fn(() => ({ sort }));

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    insertOne,
    find,
  })),
}));

import { GET, POST } from './route';

describe('/api/admin/listings route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when required fields are missing in create', async () => {
    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(insertOne).not.toHaveBeenCalled();
  });

  it('returns list payload for GET', async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(body.listings)).toBe(true);
  });

  it('persists explicit slug when provided instead of deriving from title.en', async () => {
    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: { en: 'New Title', fr: '', gr: '', de: '', it: '' },
        slug: 'custom-slug',
        listingType: 'buy',
        propertyType: 'house',
        category: ['residential'],
        tags: [],
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(201);
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'custom-slug',
      })
    );
    expect(insertOne.mock.calls[0]?.[0]?.slug).not.toBe('new-title');
  });

  it('persists predefined and custom array values in create payload', async () => {
    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: { en: 'Sunset Villa', fr: '', gr: '', de: '', it: '' },
        listingType: 'buy',
        propertyType: 'house',
        category: ['residential'],
        tags: [],
        features: ['garden', 'Roof Deck'],
        amenities: ['parking', 'Private Dock'],
        view: ['sea', 'Sunset Panorama'],
        suitableFor: ['family', 'Digital Nomads'],
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(201);
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'active',
        features: ['garden', 'Roof Deck'],
        amenities: ['parking', 'Private Dock'],
        view: ['sea', 'Sunset Panorama'],
        suitableFor: ['family', 'Digital Nomads'],
      })
    );
  });

  it('persists multiple property types and primary legacy property type', async () => {
    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: {
          en: 'Flexible Commercial Space',
          fr: '',
          gr: '',
          de: '',
          it: '',
        },
        listingType: 'buy',
        propertyTypes: ['business', 'warehouse', 'office'],
        category: ['commercial'],
        tags: [],
      }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(201);
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyType: 'business',
        propertyTypes: ['business', 'warehouse', 'office'],
      })
    );
  });

  it('normalizes legacy propertyType to propertyTypes in create payload', async () => {
    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: { en: 'Legacy House', fr: '', gr: '', de: '', it: '' },
        listingType: 'buy',
        propertyType: 'house',
        category: ['residential'],
        tags: [],
      }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(201);
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyType: 'house',
        propertyTypes: ['house'],
      })
    );
  });

  it('persists explicit paused status in create payload', async () => {
    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: { en: 'Paused Villa', fr: '', gr: '', de: '', it: '' },
        listingType: 'buy',
        propertyType: 'house',
        status: 'paused',
      }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(201);
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paused',
      })
    );
  });
});
