import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateOne = vi.fn();
const deleteFromSevallaMock = vi.hoisted(() => vi.fn());

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    updateOne,
  })),
}));

vi.mock('@/app/lib/helpers/sevalla-storage', () => ({
  deleteFromSevalla: deleteFromSevallaMock,
}));

import { DELETE } from './route';

describe('DELETE /api/admin/listings/images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes image entry and storage object', async () => {
    const request = new Request('http://localhost/api/admin/listings/images', {
      method: 'DELETE',
      body: JSON.stringify({
        listingId: 'abc',
        imageUrl: 'https://img/x.jpg',
        imageKey: 'listings/abc/x.jpg',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await DELETE(request as never);
    expect(response.status).toBe(200);
    expect(deleteFromSevallaMock).toHaveBeenCalledWith('listings/abc/x.jpg');
    expect(updateOne).toHaveBeenCalled();
  });
});
