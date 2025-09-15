/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // App Router optimisations
  },
  async headers() {
    const dev = process.env.NODE_ENV !== "production";

    if (dev) {
      // 👉 En dev : pas de CSP stricte, sinon les chunks Next.js sont bloqués
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "Content-Security-Policy", value: "" }, // désactive CSP
            { key: "Referrer-Policy", value: "no-referrer" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-XSS-Protection", value: "0" },
          ],
        },
      ];
    }

    // 👉 En prod : CSP stricte
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "script-src 'self' 'strict-dynamic'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
