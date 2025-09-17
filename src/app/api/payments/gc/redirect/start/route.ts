// src\app\api\payments\gc\redirect\start\route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies as getCookies, headers as getHeaders } from "next/headers";
import crypto from "node:crypto";
import { db } from "@/server/db/client";
import { factures } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { gcFetch } from "@/server/payments/gc-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("invoice_id");
  const clientEmail =
    url.searchParams.get("client_email") || "demo@example.com";
  const clientNom = url.searchParams.get("client_nom") || "Client Demo";

  if (!invoiceId) {
    return NextResponse.json({ error: "invoice_id manquant" }, { status: 400 });
  }

  // ⚠️ headers() est async → il faut await
  const h = await getHeaders();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("host") || "localhost:3000";
  const base = `${proto}://${host}`;

  const inv = (
    await db
      .select()
      .from(factures)
      .where(eq(factures.id, Number(invoiceId)))
      .limit(1)
  )[0];
  if (!inv) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const sessionToken = crypto.randomUUID();
  const successUrl = `${base}/api/payments/gc/redirect/complete?invoice_id=${invoiceId}`;

  try {
    const payload = {
      redirect_flows: {
        description: `Facture #${invoiceId}`,
        session_token: sessionToken,
        success_redirect_url: successUrl,
        prefilled_customer: { given_name: clientNom, email: clientEmail },
      },
    };

    const flow = await gcFetch<{
      redirect_flows: { id: string; redirect_url: string };
    }>("/redirect_flows", {
      method: "POST",
      body: JSON.stringify(payload),
      idempotencyKey: crypto.randomUUID(),
    });

    // ⚠️ cookies() aussi async
    const jar = await getCookies();
    jar.set("gc_session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
      secure: proto === "https",
    });

    return NextResponse.redirect(flow.redirect_flows.redirect_url);
  } catch (e: any) {
    console.error("[GC redirect start] fail:", e?.status, e?.body || e);
    return NextResponse.json(
      { ok: false, error: "gc_create_failed", details: e?.body || String(e) },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import crypto from "node:crypto";
// import { db } from "@/server/db/client";
// import { factures } from "@/server/db/schema";
// import { eq } from "drizzle-orm";
// import { gcFetch } from "@/server/payments/gc-http";

// export const runtime = "nodejs";

// export async function GET(req: NextRequest) {
//   const url = new URL(req.url);
//   const invoiceId = url.searchParams.get("invoice_id");
//   const clientEmail = url.searchParams.get("client_email") || "demo@example.com";
//   const clientNom = url.searchParams.get("client_nom") || "Client Demo";

//   if (!invoiceId) return NextResponse.json({ error: "invoice_id manquant" }, { status: 400 });

//   const base = process.env.APP_BASE_URL?.trim();
//   if (!base || !base.startsWith("https://")) {
//     return NextResponse.json({ error: "APP_BASE_URL doit être en HTTPS public" }, { status: 500 });
//   }

//   const inv = (await db.select().from(factures).where(eq(factures.id, Number(invoiceId))).limit(1))[0];
//   if (!inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

//   const sessionToken = crypto.randomUUID();
//   const successUrl = `${base}/api/payments/gc/redirect/complete?invoice_id=${invoiceId}`;

//   try {
//     // ⚠️ Body enveloppé sous "redirect_flows" (spec officielle)
//     const payload = {
//       redirect_flows: {
//         description: `Facture #${invoiceId}`,
//         session_token: sessionToken,
//         success_redirect_url: successUrl,
//         prefilled_customer: { given_name: clientNom, email: clientEmail },
//         // scheme: "sepa_core" // si besoin
//       },
//     };

//     const flow = await gcFetch<{ redirect_flows: { id: string; redirect_url: string } }>(
//       "/redirect_flows",
//       {
//         method: "POST",
//         body: JSON.stringify(payload),
//         idempotencyKey: crypto.randomUUID(),
//       }
//     );

//     (await cookies()).set("gc_session", sessionToken, {
//       httpOnly: true, sameSite: "lax", path: "/", maxAge: 10 * 60,
//     });

//     return NextResponse.redirect(flow.redirect_flows.redirect_url);
//   } catch (e: any) {
//     console.error("[GC redirect start] fail:", e?.status, e?.body);
//     return NextResponse.json({ ok: false, error: "gc_create_failed", details: e?.body }, { status: 500 });
//   }
// }
