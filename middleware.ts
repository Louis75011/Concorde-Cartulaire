import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function genNonce(len = 16) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Buffer.from(bytes).toString('base64');
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const nonce = genNonce();
  res.headers.set('x-nonce', nonce);

  const dev = process.env.NODE_ENV !== 'production';
  const scriptSrc = ["'self'", `'nonce-${nonce}'`];
  if (dev) scriptSrc.push("'unsafe-eval'"); // tolerated only in dev

  const styleSrc = ["'self'", `'nonce-${nonce}'`];
  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
