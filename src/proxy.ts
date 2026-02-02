import { NextRequest, NextResponse } from 'next/server';

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
  const hostname = req.headers.get('host')!;
  
  // Locale Detection for next-intl
  const locale = req.cookies.get('NEXT_LOCALE')?.value || 'en';
  const res = NextResponse.next();

  if (!req.cookies.has('NEXT_LOCALE')) {
    res.cookies.set('NEXT_LOCALE', 'en');
  }

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
