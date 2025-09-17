import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { factures, prelevements } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { gc } from "@/server/payments/gocardless-client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const flowId = url.searchParams.get("redirect_flow_id");
  const invoiceId = url.searchParams.get("invoice_id");
  const session = (await cookies()).get("gc_session")?.value;

  if (!flowId || !invoiceId || !session)
    return NextResponse.json({ error: "Paramètres incomplets" }, { status: 400 });

  const inv = (await db.select().from(factures).where(eq(factures.id, Number(invoiceId))).limit(1))[0];
  if (!inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const completed = await gc.redirectFlows.complete(flowId, { session_token: session });
  const mandateId = completed.links?.mandate;
  if (!mandateId) return NextResponse.json({ error: "Mandat non créé" }, { status: 500 });

  const amountCents = Math.round(Number(inv.montant_ttc) * 100);

  const payment = await gc.payments.create({
    amount: amountCents,
    currency: "EUR",
    links: { mandate: mandateId },
    metadata: { invoice_id: String(invoiceId) },
  });

  await db.insert(prelevements).values({
    facture_id: Number(invoiceId),
    provider_id: 1,
    montant: inv.montant_ttc,
    devise: "EUR",
    statut: "submitted",
    provider_event_id: payment.id,
  });

  return NextResponse.redirect("/factures?gc=ok");
}
