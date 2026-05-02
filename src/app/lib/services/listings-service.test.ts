import { beforeEach, describe, expect, it, vi } from 'vitest';

const countDocuments = vi.fn();
const toArray = vi.fn();

const cursor = {
  sort: vi.fn(function sortFn() {
    return cursor;
  }),
  skip: vi.fn(function skipFn() {
    return cursor;
  }),
  limit: vi.fn(function limitFn() {
    return cursor;
  }),
  toArray,
};

const find = vi.fn(() => cursor);

vi.mock('../db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    countDocuments,
    find,
  })),
}));

import { getAdminListings, searchListings } from './listings-service';

describe('searchListings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds Mongo filters and paginates', async () => {
    countDocuments.mockResolvedValue(3);
    toArray.mockResolvedValue([
      {
        id: '1',
        listingType: 'buy',
        category: ['residential'],
        title: { en: '' },
      },
    ]);

    const result = await searchListings({
      listingType: 'buy',
      category: ['residential'],
      minPrice: 100,
      maxPrice: 200,
      page: 2,
      limit: 1,
    });

    expect(countDocuments).toHaveBeenCalledWith({
      listingType: 'buy',
      status: { $exists: true, $ne: null },
      category: { $in: ['residential'] },
      price: { $gte: 100, $lte: 200 },
    });
    expect(cursor.skip).toHaveBeenCalledWith(1);
    expect(cursor.limit).toHaveBeenCalledWith(1);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(3);
  });
});

describe('getAdminListings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses empty query, default sort, and page size 50 when no filters', async () => {
    countDocuments.mockResolvedValue(2);
    toArray.mockResolvedValue([]);

    const result = await getAdminListings({});

    expect(countDocuments).toHaveBeenCalledWith({});
    expect(find).toHaveBeenCalledWith({}, { projection: { _id: 0 } });
    expect(cursor.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(cursor.skip).toHaveBeenCalledWith(0);
    expect(cursor.limit).toHaveBeenCalledWith(50);
    expect(result.limit).toBe(50);
    expect(result.page).toBe(1);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it('does not add status existence guard', async () => {
    countDocuments.mockResolvedValue(0);
    toArray.mockResolvedValue([]);

    await getAdminListings({ status: 'active' });

    expect(countDocuments).toHaveBeenCalledWith({ status: 'active' });
  });

  it('builds category filter with $in single value', async () => {
    countDocuments.mockResolvedValue(0);
    toArray.mockResolvedValue([]);

    await getAdminListings({ category: 'residential' });

    expect(countDocuments).toHaveBeenCalledWith({
      category: { $in: ['residential'] },
    });
  });

  it('combines filters and applies custom sort', async () => {
    countDocuments.mockResolvedValue(1);
    toArray.mockResolvedValue([]);

    await getAdminListings({
      listingType: 'rent',
      propertyType: 'apartment',
      sortField: 'price',
      sortDirection: 'asc',
    });

    expect(countDocuments).toHaveBeenCalledWith({
      listingType: 'rent',
      propertyType: 'apartment',
    });
    expect(cursor.sort).toHaveBeenCalledWith({ price: 1 });
  });

  it('skips correctly for page 2', async () => {
    countDocuments.mockResolvedValue(100);
    toArray.mockResolvedValue([]);

    const result = await getAdminListings({ page: 2 });

    expect(cursor.skip).toHaveBeenCalledWith(50);
    expect(result.totalPages).toBe(2);
  });
});
