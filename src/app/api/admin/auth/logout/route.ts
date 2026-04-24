import { NextResponse } from 'next/server';

import { getAdminTokenCookieName } from '@/app/lib/helpers/admin-auth';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(getAdminTokenCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });

  return response;
}
