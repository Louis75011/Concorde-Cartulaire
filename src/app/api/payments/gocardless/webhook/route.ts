import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { payments, factures } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

type GCEvent = {
  id: string;
  resource_type: "payments" | "mandates" | string;
  action: string; // "created" | "submitted" | "confirmed" | "failed" | ...
  links?: { payment?: string; mandate?: string };
};

export async function POST(req: Request) {
  // Pour la démo, on ne valide pas la signature.
  // En prod : validez l'en-tête "Webhook-Signature" avec GOCARDLESS_WEBHOOK_SECRET.
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 });

  const events: GCEvent[] = body.events ?? [];
  for (const ev of events) {
    if (ev.resource_type !== "payments") continue;
    const pid = ev.links?.payment;
    if (!pid) continue;

    const p = (await db.select().from(payments).where(eq(payments.providerPaymentId, pid)).limit(1))[0];
    if (!p) continue;

    await db.update(payments).set({ status: ev.action }).where(eq(payments.id, p.id));

    if (ev.action === "confirmed") {
      await db.update(factures).set({ statut_paiement: "payee" }).where(eq(factures.id, p.invoiceId));
    }
    if (ev.action === "failed") {
      await db.update(factures).set({ statut_paiement: "en_retard" }).where(eq(factures.id, p.invoiceId));
    }
  }

  return NextResponse.json({ ok: true });
}
