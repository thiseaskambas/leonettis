import { beforeEach, describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const insertOne = vi.fn();

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    findOne,
    insertOne,
  })),
}));

vi.mock('@/app/lib/mock-data/listings-data', () => ({
  listingsData: [{ id: 'a' }, { id: 'b' }],
}));

import { POST } from './route';

describe('POST /api/admin/seed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts only missing listings', async () => {
    findOne.mockResolvedValueOnce({ id: 'a' }).mockResolvedValueOnce(null);

    const response = await POST();
    const body = await response.json();

    expect(insertOne).toHaveBeenCalledTimes(1);
    expect(body).toEqual({ inserted: 1, skipped: 1 });
  });
});
