import { describe, expect, it } from 'vitest';

import {
  currentSortSelectValue,
  parseAdminParams,
  splitSortOptionValue,
} from './admin-params';

describe('parseAdminParams', () => {
  it('returns empty object for empty input', () => {
    expect(parseAdminParams({})).toEqual({});
  });

  it('parses valid filters and page', () => {
    expect(
      parseAdminParams({
        status: 'active',
        listingType: 'buy',
        category: 'residential',
        propertyType: 'house',
        page: '3',
      })
    ).toEqual({
      status: 'active',
      listingType: 'buy',
      category: 'residential',
      propertyType: 'house',
      page: 3,
    });
  });

  it('ignores invalid enum-like values', () => {
    expect(
      parseAdminParams({
        status: 'bogus',
        listingType: 'lease',
        category: 'castle',
        propertyType: 'yacht',
        page: '0',
      })
    ).toEqual({});
  });

  it('ignores non-numeric page and rejects page below 1', () => {
    expect(parseAdminParams({ page: 'abc' })).toEqual({});
    expect(parseAdminParams({ page: '-1' })).toEqual({});
  });

  it('parses sort and dir', () => {
    expect(
      parseAdminParams({
        sort: 'publishedAt',
        dir: 'asc',
      })
    ).toEqual({
      sortField: 'publishedAt',
      sortDirection: 'asc',
    });
  });

  it('ignores invalid sort field or dir', () => {
    expect(parseAdminParams({ sort: 'title.fr', dir: 'desc' })).toEqual({
      sortDirection: 'desc',
    });
    expect(parseAdminParams({ sort: 'price', dir: 'sideways' })).toEqual({
      sortField: 'price',
    });
  });
});

describe('splitSortOptionValue', () => {
  it('parses title.en with last underscore rule', () => {
    expect(splitSortOptionValue('title.en_desc')).toEqual({
      field: 'title.en',
      dir: 'desc',
    });
    expect(splitSortOptionValue('title.en_asc')).toEqual({
      field: 'title.en',
      dir: 'asc',
    });
  });

  it('parses simple field names', () => {
    expect(splitSortOptionValue('updatedAt_desc')).toEqual({
      field: 'updatedAt',
      dir: 'desc',
    });
  });

  it('returns null for malformed values', () => {
    expect(splitSortOptionValue('updatedAt')).toBeNull();
    expect(splitSortOptionValue('_desc')).toBeNull();
    expect(splitSortOptionValue('title.en_invalid')).toBeNull();
  });
});

describe('currentSortSelectValue', () => {
  it('defaults to updatedAt desc', () => {
    expect(currentSortSelectValue(null, null)).toBe('updatedAt_desc');
  });

  it('reflects valid URL params', () => {
    expect(currentSortSelectValue('price', 'asc')).toBe('price_asc');
  });
});
