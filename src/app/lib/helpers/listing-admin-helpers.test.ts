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

  it('keeps trimmed predefined and custom array values', () => {
    const payload = sanitizeListingInput({
      features: ['garden', ' roof deck ', ''],
      amenities: ['parking', ' Private Dock '],
      view: ['sea', ' Sunset Panorama '],
      suitableFor: ['family', ' Digital Nomads '],
    });

    expect(payload.features).toEqual(['garden', 'roof deck']);
    expect(payload.amenities).toEqual(['parking', 'Private Dock']);
    expect(payload.view).toEqual(['sea', 'Sunset Panorama']);
    expect(payload.suitableFor).toEqual(['family', 'Digital Nomads']);
  });

  it('accepts valid status and ignores removed lifecycle booleans', () => {
    const payload = sanitizeListingInput({
      status: 'pending',
      isActive: true,
      isSold: true,
      isRented: true,
    });

    expect(payload.status).toBe('pending');
    expect(payload).not.toHaveProperty('isActive');
    expect(payload).not.toHaveProperty('isSold');
    expect(payload).not.toHaveProperty('isRented');
  });

  it('normalizes videos as metadata objects', () => {
    const payload = sanitizeListingInput({
      videos: [
        {
          url: 'https://cdn.example.com/listings/1/videos/clip.mp4',
          name: 'clip.mp4',
          key: 'listings/1/videos/clip.mp4',
          description: 'Walkthrough',
          contentType: 'video/mp4',
        },
      ],
    });

    expect(payload.videos).toEqual([
      {
        url: 'https://cdn.example.com/listings/1/videos/clip.mp4',
        name: 'clip.mp4',
        key: 'listings/1/videos/clip.mp4',
        description: 'Walkthrough',
        contentType: 'video/mp4',
      },
    ]);
  });

  it('supports legacy string video arrays', () => {
    const payload = sanitizeListingInput({
      videos: ['https://cdn.example.com/listings/1/videos/clip.mp4'],
    });

    expect(payload.videos).toEqual([
      {
        url: 'https://cdn.example.com/listings/1/videos/clip.mp4',
        name: 'clip.mp4',
      },
    ]);
  });
});
