// src\app\api\payments\gc\test\route.ts
export const runtime = "nodejs";

export async function GET() {
  const token = process.env.GOCARDLESS_ACCESS_TOKEN?.trim();
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Missing GOCARDLESS_ACCESS_TOKEN" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const r = await fetch("https://api-sandbox.gocardless.com/customers?limit=1", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "GoCardless-Version": "2015-07-06",
      Accept: "application/json",
      // ⚠️ ajoutez un User-Agent custom sinon parfois Cloudflare bloque
      "User-Agent": "ConcordeCartulaire/0.1 (localdev)",
    },
  });

  const body = await r.text();

  return new Response(body, {
    status: r.status,
    headers: { "content-type": "application/json" },
  });
}

// import { NextResponse } from "next/server";
// import { gc } from "@/server/payments/gocardless-client";

// export const runtime = "nodejs";

// export async function GET() {
//   try {
//     const list = await gc.customers.list({ limit: 1 });
//     return NextResponse.json({ ok: true, env: process.env.GOCARDLESS_ENV, count: list.customers.length });
//   } catch (e: any) {
//     // Le SDK renvoie une Error enrichie
//     return NextResponse.json({
//       ok: false,
//       env: process.env.GOCARDLESS_ENV,
//       errorType: e?.errorType,
//       code: e?.code,
//       docs: e?.documentationUrl,
//       // utile pour debugger:
//       requestId: e?.requestId,
//       raw: e?.errors,
//     }, { status: 500 });
//   }
// }
