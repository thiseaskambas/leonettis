import { describe, expect, it } from 'vitest';

import {
  buildListingSlug,
  sanitizeListingInput,
} from './listing-admin-helpers';

describe('listing-admin-helpers', () => {
  it('builds slug from english title', () => {
    const slug = buildListingSlug({
      title: {
        en: 'My New Listing',
        fr: '',
        gr: '',
        de: '',
        it: '',
      },
    });

    expect(slug).toBe('my-new-listing');
  });

  it('sanitizes array and locale fields', () => {
    const payload = sanitizeListingInput({
      title: { en: 'Hello', fr: 'Bonjour' },
      category: ['residential', '', 1],
      tags: ['one', 'two'],
      address: {
        city: 'Paros',
        zipCode: '84400',
        country: 'GR',
        coordinates: { lat: 1, lng: 2 },
      },
    });

    expect(payload.title?.en).toBe('Hello');
    expect(payload.title?.gr).toBe('');
    expect(payload.category).toEqual(['residential']);
    expect(payload.tags).toEqual(['one', 'two']);
    expect(payload.address?.city).toBe('Paros');
  });

  it('preserves explicit empty arrays for clear operations', () => {
    const payload = sanitizeListingInput({
      tags: [],
      features: [],
      amenities: [],
      view: [],
      suitableFor: [],
      videos: [],
    });

    expect(payload.tags).toEqual([]);
    expect(payload.features).toEqual([]);
    expect(payload.amenities).toEqual([]);
    expect(payload.view).toEqual([]);
    expect(payload.suitableFor).toEqual([]);
    expect(payload.videos).toEqual([]);
  });

  it('preserves image key metadata', () => {
    const payload = sanitizeListingInput({
      images: [
        {
          url: 'https://cdn.example.com/listings/1/main.jpg',
          name: 'main.jpg',
          key: 'listings/1/main.jpg',
          description: 'Front exterior',
        },
      ],
    });

    expect(payload.images).toEqual([
      {
        url: 'https://cdn.example.com/listings/1/main.jpg',
        name: 'main.jpg',
        key: 'listings/1/main.jpg',
        description: 'Front exterior',
      },
    ]);
  });
});
