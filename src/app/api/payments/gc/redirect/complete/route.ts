// src/app/api/payments/gc/redirect/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { factures, prelevements } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { gcFetch } from "@/server/payments/gc-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("invoice_id");
  const flowId = url.searchParams.get("redirect_flow_id") || url.searchParams.get("flow_id");

  const session = req.headers.get("cookie")?.match(/gc_session=([^;]+)/)?.[1];
  if (!invoiceId || !flowId || !session) {
    return NextResponse.json({ error: "Paramètres incomplets (invoice_id / redirect_flow_id / session)" }, { status: 400 });
  }

  const inv = (await db.select().from(factures).where(eq(factures.id, Number(invoiceId))).limit(1))[0];
  if (!inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  try {
    const complete = await gcFetch<{ redirect_flows: { links?: { mandate?: string } } }>(
      `/redirect_flows/${flowId}/actions/complete`,
      { method: "POST", body: JSON.stringify({ data: { session_token: session } }), idempotencyKey: flowId }
    );

    const mandateId = complete.redirect_flows.links?.mandate;
    if (!mandateId) return NextResponse.json({ error: "Mandat non créé" }, { status: 500 });

    const amountCents = Math.round(Number(inv.montant_ttc) * 100);
    const pay = await gcFetch<{ payments: { id: string; status: string } }>(
      "/payments",
      { method: "POST",
        body: JSON.stringify({ payments: { amount: amountCents, currency: "EUR", links: { mandate: mandateId }, metadata: { invoice_id: String(invoiceId) } } }),
        idempotencyKey: `pay_${invoiceId}_${amountCents}`,
      }
    );

    await db.insert(prelevements).values({
      facture_id: Number(invoiceId), provider_id: 1, montant: inv.montant_ttc,
      devise: "EUR", statut: "submitted", provider_event_id: pay.payments.id,
    });

    const res = NextResponse.redirect("/factures?gc=ok");
    res.cookies.set("gc_session", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
    return res;
  } catch (e: any) {
    console.error("[GC redirect complete] fail:", e?.status, e?.body || e);
    return NextResponse.json({ ok: false, error: "gc_complete_failed", details: e?.body || String(e) }, { status: 500 });
  }
}
