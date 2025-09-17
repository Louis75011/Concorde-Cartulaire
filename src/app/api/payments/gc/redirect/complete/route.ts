import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { gcFetch } from "@/server/payments/gocardless";
import { db } from "@/server/db/client";
import { payments, factures, gcMandates } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// GET /api/payments/gc/redirect/complete?redirect_flow_id=RF123 (fourni par GC) & invoice_id=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectFlowId = url.searchParams.get("redirect_flow_id");
  const invoiceId = Number(url.searchParams.get("invoice_id"));
  const sessionToken = (await cookies()).get("gc_session")?.value;

  if (!redirectFlowId || !invoiceId || !sessionToken) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // 1) Compléter le redirect flow (récupérer le mandat)
  const payload = { data: { session_token: sessionToken } }; // suivant la spec GC
  const completed = await gcFetch<{ redirect_flows: { links: { mandate: string } } }>(
    `/redirect_flows/${redirectFlowId}/actions/complete`,
    { method: "POST", body: JSON.stringify(payload) }
  );

  const mandateId = completed.redirect_flows.links.mandate;

  // 2) Enregistrer le mandat (si besoin) — ici on stocke minimalement
  await db.insert(gcMandates).values({
    clientId: 0, // liez au vrai client si vous avez l’ID
    gcMandateId: mandateId,
    status: "active",
  }).onConflictDoNothing();

  // 3) Récupérer la facture pour le montant
  const inv = (await db.select().from(factures).where(eq(factures.id, invoiceId)).limit(1))[0];
  if (!inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const amountCents = Math.round(Number(inv.montant_ttc) * 100); // selon votre type
  const createPaymentPayload = {
    payments: {
      amount: amountCents,
      currency: "EUR",
      links: { mandate: mandateId },
      metadata: { invoice_id: String(invoiceId) },
    },
  };

  // 4) Créer le paiement
  const pay = await gcFetch<{ payments: { id: string; status: string } }>(
    "/payments",
    { method: "POST", body: JSON.stringify(createPaymentPayload) }
  );

  // 5) Sauvegarder côté app (statut "submitted")
  await db.insert(payments).values({
    invoiceId,
    providerPaymentId: pay.payments.id,
    amountCents,
    status: pay.payments.status || "submitted",
  });

  // 6) Démo rapide : marquer la facture "payée" immédiatement
  //    (en vrai, faites-le via webhook une fois "confirmed")
  await db.update(factures).set({ statut_paiement: "payee" }).where(eq(factures.id, invoiceId));

  // 7) Rediriger vers l’UI factures
  return NextResponse.redirect(`${process.env.APP_BASE_URL}/factures?paid=1`);
}
