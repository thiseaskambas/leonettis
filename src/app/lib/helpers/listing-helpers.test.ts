import { beforeEach, describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();

vi.mock('../db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    findOne,
  })),
}));

import { getListingBySlug } from './listing-helpers';

describe('getListingBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries only public listings by slug', async () => {
    findOne.mockResolvedValueOnce(null);

    const listing = await getListingBySlug('paused-villa');

    expect(listing).toBeNull();
    expect(findOne).toHaveBeenCalledWith(
      {
        slug: 'paused-villa',
        status: { $exists: true, $nin: [null, 'paused'] },
      },
      { projection: { _id: 0 } }
    );
  });
});
