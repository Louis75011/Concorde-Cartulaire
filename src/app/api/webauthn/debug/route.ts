// src/app/api/webauthn/debug/route.ts
export const runtime = "nodejs";
export async function GET() {
  return new Response(
    JSON.stringify({
      rpID: process.env.WEBAUTHN_RP_ID,
      origin: process.env.WEBAUTHN_ORIGIN,
      appBaseUrl: process.env.APP_BASE_URL,
    }),
    { headers: { "content-type": "application/json" } }
  );
}
