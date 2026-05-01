import { NextRequest, NextResponse } from 'next/server';

import {
  getAdminTokenCookieName,
  isValidAdminPassword,
  signAdminToken,
} from '@/app/lib/helpers/admin-auth';

interface LoginPayload {
  password?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: LoginPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const password = body.password?.trim() ?? '';
  if (!password) {
    return NextResponse.json(
      { error: 'Password is required' },
      { status: 400 }
    );
  }

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signAdminToken();
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(getAdminTokenCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
