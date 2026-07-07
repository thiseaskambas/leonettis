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

  it('derives slug from title.en when slug is omitted or empty', async () => {
    const omittedSlugRequest = new Request(
      'http://localhost/api/admin/listings',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: { en: 'Sunset Villa', fr: '', gr: '', de: '', it: '' },
          listingType: 'buy',
          propertyType: 'house',
        }),
      }
    );

    const omittedSlugResponse = await POST(omittedSlugRequest as never);
    expect(omittedSlugResponse.status).toBe(201);
    expect(insertOne).toHaveBeenLastCalledWith(
      expect.objectContaining({
        slug: 'sunset-villa',
      })
    );

    const emptySlugRequest = new Request(
      'http://localhost/api/admin/listings',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: { en: 'Harbor House', fr: '', gr: '', de: '', it: '' },
          slug: '   ',
          listingType: 'buy',
          propertyType: 'house',
        }),
      }
    );

    const emptySlugResponse = await POST(emptySlugRequest as never);
    expect(emptySlugResponse.status).toBe(201);
    expect(insertOne).toHaveBeenLastCalledWith(
      expect.objectContaining({
        slug: 'harbor-house',
      })
    );
  });

  it('rejects explicit invalid slug on create', async () => {
    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: { en: 'New Title', fr: '', gr: '', de: '', it: '' },
        slug: '!!!',
        listingType: 'buy',
        propertyType: 'house',
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe(
      'slug must contain at least one URL-safe character after normalization'
    );
    expect(insertOne).not.toHaveBeenCalled();
  });

  it('returns friendly error when generated slug already exists', async () => {
    insertOne.mockRejectedValueOnce({ code: 11000 });

    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: { en: 'Duplicate Villa', fr: '', gr: '', de: '', it: '' },
        listingType: 'buy',
        propertyType: 'house',
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('slug already exists');
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
