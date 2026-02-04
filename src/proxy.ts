import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedPaths = ['/dashboard', '/admin', '/onboarding'];

// Routes that should redirect to dashboard if already logged in
const authPaths = ['/login', '/register'];

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const hostname = req.headers.get('host')!;

  // Locale Detection for next-intl
  const locale = req.cookies.get('NEXT_LOCALE')?.value || 'en';
  let res = NextResponse.next();

  if (!req.cookies.has('NEXT_LOCALE')) {
    res.cookies.set('NEXT_LOCALE', 'en');
  }

  // === AUTH PROTECTION ===
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath || isAuthPath) {
    // Get the session token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthenticated = !!token;

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedPath && !isAuthenticated) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users from auth routes to dashboard
    if (isAuthPath && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check tenant registration status for protected routes
    if (isProtectedPath && isAuthenticated && token) {
      const registrationStatus = token.registrationStatus as string | undefined;
      const role = token.role as string | undefined;
      const onboardingStatus = token.onboardingStatus as string | undefined;

      // Allow SUPER_ADMIN to access everything
      if (role !== 'SUPER_ADMIN') {
        // Redirect pending users to pending-approval page
        if (registrationStatus === 'PENDING' && !pathname.startsWith('/pending-approval')) {
          return NextResponse.redirect(new URL('/pending-approval', req.url));
        }

        // Check onboarding status
        if (
          onboardingStatus === 'PENDING' &&
          !pathname.startsWith('/onboarding') &&
          !pathname.startsWith('/pending-approval')
        ) {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      }
    }
  }

  // === MULTI-TENANT ROUTING ===

  // Define allowed domains for the main app
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';

  // 1. Handle local development or main landing page variants
  const isLocalBase = hostname === 'localhost:3000' ||
                      hostname === '127.0.0.1:3000' ||
                      hostname === '127.0.0.1.nip.io:3000' ||
                      hostname === 'lvh.me:3000';

  const isMainDomain = isLocalBase ||
                       hostname === rootDomain ||
                       hostname === `www.${rootDomain}` ||
                       hostname.endsWith('.vercel.app');

  if (isMainDomain) {
    return res;
  }

  // 2. Extract subdomain vs custom domain
  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // Local testing subdomains (e.g. acme.localhost:3000, acme.lvh.me:3000, or acme.127.0.0.1.nip.io:3000)
  const isLocalSubdomain = hostname.endsWith('.localhost:3000') ||
                           hostname.endsWith('.lvh.me:3000') ||
                           hostname.endsWith('.127.0.0.1.nip.io:3000');

  if (isLocalSubdomain) {
    const slug = hostname.split('.')[0];
    res.headers.set('x-tenant-slug', slug);
    return res;
  }

  // If it's a production subdomain (e.g. acme.easeinventory.com)
  if (hostname.endsWith(`.${rootDomain}`)) {
    const slug = hostname.replace(`.${rootDomain}`, '');
    res.headers.set('x-tenant-slug', slug);
    return res;
  }

  // 3. Handle Custom Domains (e.g. inventory.acme.com)
  // We'll trust the host header for now, and the app will verify it against the DB in auth/layout
  res.headers.set('x-tenant-host', hostname);
  return res;
}
