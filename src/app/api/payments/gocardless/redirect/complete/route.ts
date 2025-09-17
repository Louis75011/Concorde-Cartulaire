import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { gcFetch } from "@/server/payments/gocardless";
import { db } from "@/server/db/client";
import { payments, factures } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// GET /api/payments/gocardless/redirect/complete?redirect_flow_id=RFxxx&invoice_id=123
export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectFlowId = url.searchParams.get("redirect_flow_id");
  const invoiceId = Number(url.searchParams.get("invoice_id"));
  const sessionToken = (await cookies()).get("gc_session")?.value;

  if (!redirectFlowId || !invoiceId || !sessionToken) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // 1) Complete → mandat
  const completed = await gcFetch<{ redirect_flows: { links: { mandate: string } } }>(
    `/redirect_flows/${redirectFlowId}/actions/complete`,
    { method: "POST", body: JSON.stringify({ data: { session_token: sessionToken } }) }
  );
  const mandateId = completed.redirect_flows.links.mandate;

  // 2) Charger facture, calculer montant
  const inv = (await db.select().from(factures).where(eq(factures.id, invoiceId)).limit(1))[0];
  if (!inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const amountCents = Math.round(Number(inv.montant_ttc) * 100);

  // 3) Créer paiement
  const pay = await gcFetch<{ payments: { id: string; status: string } }>(
    "/payments",
    { method: "POST", body: JSON.stringify({ payments: { amount: amountCents, currency: "EUR", links: { mandate: mandateId }, metadata: { invoice_id: String(invoiceId) } } }) }
  );

  // 4) Sauvegarder + statut "submitted"
  await db.insert(payments).values({
    invoiceId,
    providerPaymentId: pay.payments.id,
    amountCents,
    status: pay.payments.status || "submitted",
  });

  // 5) Démo : on peut marquer payé de suite (à remplacer par le webhook en réel)
  await db.update(factures).set({ statut_paiement: "payee" }).where(eq(factures.id, invoiceId));

  return NextResponse.redirect(`${process.env.APP_BASE_URL}/factures?paid=1`);
}
