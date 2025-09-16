// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function genNonce(len = 16) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const vercelEnv = process.env.VERCEL_ENV; // 'development' | 'preview' | 'production'
  const isProd = vercelEnv === "production";
  const nonce = genNonce();
  res.headers.set("x-nonce", nonce);

  const scriptSrc = isProd
    // STRICTE en prod : pas d'unsafe, pas de strict-dynamic
    ? ["'self'", `'nonce-${nonce}'`]
    // RELAX en preview : on débloque Next
    : ["'self'", "'unsafe-inline'", "'unsafe-eval'"];

  const styleSrc = isProd
    ? ["'self'", `'nonce-${nonce}'`]
    : ["'self'", "'unsafe-inline'"];

  const csp = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return res;
}

export const config = {
  // On n’injecte pas la CSP sur les assets statiques _next
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
