import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Routes that should only be accessible by guests (not logged-in users)
const GUEST_ONLY = ['/login', '/register', '/forgot-password', '/reset-password'];

// Routes that require authentication
const AUTH_ONLY = ['/settings', '/profile'];

function matchSegment(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route + '/');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip on Next.js prefetch requests to avoid noisy redirects
  const isPrefetch =
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('x-middleware-prefetch') === '1';
  if (isPrefetch) return NextResponse.next();

  // Robust token detection: cookie store + raw header fallback
  const cookieHeader = req.headers.get('cookie') || '';
  const headerHasToken = /(^|;\s*)token=/.test(cookieHeader);
  const hasToken = Boolean(req.cookies.get('token')?.value) || headerHasToken;

  // Redirect authenticated users away from guest-only pages
  if (GUEST_ONLY.some((p) => matchSegment(pathname, p))) {
    if (hasToken) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      const res = NextResponse.redirect(url);
      res.headers.set('x-mw-auth', 'guest-block');
      res.headers.set('x-mw-has-token', hasToken ? '1' : '0');
      return res;
    }
  }

  // Redirect unauthenticated users away from auth-only pages
  if (AUTH_ONLY.some((p) => matchSegment(pathname, p))) {
    if (!hasToken) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      const res = NextResponse.redirect(url);
      res.headers.set('x-mw-auth', 'auth-block');
      res.headers.set('x-mw-has-token', hasToken ? '1' : '0');
      return res;
    }
  }

  const res = NextResponse.next();
  res.headers.set('x-mw-auth', 'pass');
  res.headers.set('x-mw-has-token', hasToken ? '1' : '0');
  return res;
}

// Limit middleware to relevant routes only (avoid API, Next internals, and static files)
export const config = {
  matcher: ['/((?!api|_next|.*\..*).*)'],
};
