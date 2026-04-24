import { beforeEach, describe, expect, it } from 'vitest';

import {
  isValidAdminPassword,
  signAdminToken,
  verifyAdminToken,
} from './admin-auth';

describe('admin-auth', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'top-secret';
    process.env.ADMIN_JWT_SECRET = 'abcdefghijklmnopqrstuvwxyz123456';
  });

  it('validates the configured admin password', () => {
    expect(isValidAdminPassword('top-secret')).toBe(true);
    expect(isValidAdminPassword('wrong')).toBe(false);
  });

  it('signs and verifies an admin token', async () => {
    const token = await signAdminToken();
    await expect(verifyAdminToken(token)).resolves.toBe(true);
    await expect(verifyAdminToken(`${token}broken`)).resolves.toBe(false);
  });
});
