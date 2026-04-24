import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertOne = vi.fn();
const sort = vi.fn(() => ({ toArray: vi.fn(async () => []) }));
const find = vi.fn(() => ({ sort }));

vi.mock('@/app/lib/db/mongodb', () => ({
  getListingsCollection: vi.fn(async () => ({
    insertOne,
    find,
  })),
}));

import { GET, POST } from './route';

describe('/api/admin/listings route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when required fields are missing in create', async () => {
    const request = new Request('http://localhost/api/admin/listings', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(insertOne).not.toHaveBeenCalled();
  });

  it('returns list payload for GET', async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(body.listings)).toBe(true);
  });
});
