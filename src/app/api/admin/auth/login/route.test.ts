import { describe, expect, it } from 'vitest';

import { POST } from './route';

describe('POST /api/admin/auth/login', () => {
  it('returns 401 for invalid password', async () => {
    process.env.ADMIN_PASSWORD = 'secret';
    process.env.ADMIN_JWT_SECRET = 'abcdefghijklmnopqrstuvwxyz123456';

    const request = new Request('http://localhost/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as never);
    expect(response.status).toBe(401);
  });

  it('sets cookie for valid password', async () => {
    process.env.ADMIN_PASSWORD = 'secret';
    process.env.ADMIN_JWT_SECRET = 'abcdefghijklmnopqrstuvwxyz123456';

    const request = new Request('http://localhost/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'secret' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);
    expect(response.cookies.get('admin_token')?.value).toBeTruthy();
  });
});
