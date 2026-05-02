import { describe, expect, it } from 'vitest';

import { getListingCategoryLabel, getListingTitleEn } from './listing-row-utils';

describe('listing-row-utils', () => {
  it('returns english title when valid', () => {
    expect(getListingTitleEn({ title: { en: 'Sea View Villa' } })).toBe(
      'Sea View Villa'
    );
  });

  it('falls back when title is null', () => {
    expect(getListingTitleEn({ title: null })).toBe('Untitled listing');
  });

  it('falls back when english title is missing or blank', () => {
    expect(getListingTitleEn({ title: {} })).toBe('Untitled listing');
    expect(getListingTitleEn({ title: { en: '   ' } })).toBe('Untitled listing');
  });

  it('returns joined categories when valid', () => {
    expect(
      getListingCategoryLabel({ category: ['residential', 'commercial'] })
    ).toBe('residential, commercial');
  });

  it('falls back when category is null or empty', () => {
    expect(getListingCategoryLabel({ category: null })).toBe('N/A');
    expect(getListingCategoryLabel({ category: [] })).toBe('N/A');
    expect(getListingCategoryLabel({ category: ['  ', 123] })).toBe('N/A');
  });
});
