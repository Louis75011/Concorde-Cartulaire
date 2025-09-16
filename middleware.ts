import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

function genNonce(len = 16) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

// Routes protégées
const PROTECTED = [
  /^\/clients/,
  /^\/contrats/,
  /^\/factures/,
  /^\/prestataires/,
  /^\/collaborateurs/,
  /^\/paiements/,
  /^\/settings/,
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // === Auth check ===
  const path = req.nextUrl.pathname;
  if (PROTECTED.some((r) => r.test(path))) {
    const token = req.cookies.get("sid")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // === CSP & headers ===
  const nonce = genNonce();
  const vercelEnv = process.env.VERCEL_ENV;
  const isProd = vercelEnv === "production";

  const scriptSrc = isProd
    ? ["'self'", `'nonce-${nonce}'`]
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
  res.headers.set("x-nonce", nonce);
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // return NextResponse.next();
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
