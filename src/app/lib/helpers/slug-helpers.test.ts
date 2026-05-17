import { describe, expect, it } from 'vitest';

import { resolveListingFormSlug, slugify } from './slug-helpers';

describe('resolveListingFormSlug', () => {
  it('returns trimmed raw slug in edit mode without using title.en', () => {
    expect(
      resolveListingFormSlug('edit', {
        slug: '!!!',
        titleEn: 'Beach House',
        slugTouched: false,
      })
    ).toBe('!!!');

    expect(
      resolveListingFormSlug('edit', {
        slug: '  My Custom Slug  ',
        titleEn: 'Beach House',
        slugTouched: false,
      })
    ).toBe('My Custom Slug');
  });

  it('derives slug from title.en on create when slug is untouched', () => {
    expect(
      resolveListingFormSlug('create', {
        slug: '',
        titleEn: 'Beach House',
        slugTouched: false,
      })
    ).toBe('beach-house');
  });

  it('slugifies explicit slug on create when slugTouched', () => {
    expect(
      resolveListingFormSlug('create', {
        slug: 'My Custom Slug',
        titleEn: 'Beach House',
        slugTouched: true,
      })
    ).toBe('my-custom-slug');
  });

  it('does not fall back to title.en on create when slugTouched with invalid slug', () => {
    expect(
      resolveListingFormSlug('create', {
        slug: '!!!',
        titleEn: 'Beach House',
        slugTouched: true,
      })
    ).toBe('');
  });
});

describe('slugify', () => {
  it('normalizes invalid slug input to empty string', () => {
    expect(slugify('!!!')).toBe('');
  });
});
