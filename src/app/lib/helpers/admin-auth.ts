import { jwtVerify, SignJWT } from 'jose';

const ADMIN_TOKEN_COOKIE = 'admin_token';
const TOKEN_EXPIRATION = '7d';

function getAdminSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET must be at least 32 characters');
  }

  return secret;
}

export function getAdminTokenCookieName(): string {
  return ADMIN_TOKEN_COOKIE;
}

export async function signAdminToken(): Promise<string> {
  const secret = new TextEncoder().encode(getAdminSecret());

  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(getAdminSecret());
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export function isValidAdminPassword(password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }

  return password === expectedPassword;
}
