import { beforeEach, describe, expect, it, vi } from 'vitest';

const countDocuments = vi.fn();
const toArray = vi.fn();
const limit = vi.fn(() => ({ toArray }));
const skip = vi.fn(() => ({ limit }));
const find = vi.fn(() => ({ skip, limit, toArray }));

vi.mock('../db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    countDocuments,
    find,
  })),
}));

import { searchListings } from './listings-service';

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
      category: { $in: ['residential'] },
      price: { $gte: 100, $lte: 200 },
    });
    expect(skip).toHaveBeenCalledWith(1);
    expect(limit).toHaveBeenCalledWith(1);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(3);
  });
});
