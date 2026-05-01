import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import {
  getAdminTokenCookieName,
  verifyAdminToken,
} from '@/app/lib/helpers/admin-auth';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

function isAdminPage(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isAdminApi(pathname: string): boolean {
  return pathname === '/api/admin' || pathname.startsWith('/api/admin/');
}

function isAdminPublicPath(pathname: string): boolean {
  return (
    pathname === '/admin/login' ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout'
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPage(pathname) || isAdminApi(pathname)) {
    if (isAdminPublicPath(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get(getAdminTokenCookieName())?.value;
    if (!token || !(await verifyAdminToken(token))) {
      if (isAdminApi(pathname)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!trpc|_next|_vercel|.*\\..*).*)',
};
