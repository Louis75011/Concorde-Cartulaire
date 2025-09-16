import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Génère un nonce base64 sans Buffer (compatible Edge)
function genNonce(len = 16) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Pas de CSP en dev (et, si souhaité, en preview Vercel)
  const isDev = process.env.NODE_ENV !== "production";
  const isPreview = process.env.VERCEL_ENV === "preview";
  if (isDev || isPreview) return res;

  // Prod : CSP + nonce
  const nonce = genNonce();
  res.headers.set("x-nonce", nonce);

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`, // TEMPORAIRE : à retirer quand tout est noncé
    "'unsafe-inline'",
    "'unsafe-eval'",
  ];

  const styleSrc = [
    "'self'",
    `'nonce-${nonce}'`, // TEMPORAIRE : à retirer quand Emotion/MUI reçoit bien le nonce
    "'unsafe-inline'",
  ];

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
