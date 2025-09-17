import { NextResponse } from "next/server";
import { gcFetch } from "@/server/payments/gocardless";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { factures } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// GET /api/payments/gocardless/redirect/start?invoice_id=123&client_email=...&client_nom=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const invoiceId = Number(url.searchParams.get("invoice_id"));
  const email = url.searchParams.get("client_email") || "demo@example.com";
  const nom = url.searchParams.get("client_nom") || "Client Démo";

  if (!invoiceId) {
    return NextResponse.json({ error: "invoice_id manquant" }, { status: 400 });
  }

  const inv = (await db.select().from(factures).where(eq(factures.id, invoiceId)).limit(1))[0];
  if (!inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const sessionToken = crypto.randomUUID();
  (await cookies()).set("gc_session", sessionToken, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 10 * 60,
  });

  const successUrl = `${process.env.APP_BASE_URL}/api/payments/gocardless/redirect/complete?invoice_id=${invoiceId}`;
  const payload = {
    redirect_flows: {
      description: `Paiement facture #${inv.id}`,
      session_token: sessionToken,
      success_redirect_url: successUrl,
      prefilled_customer: { given_name: nom, email },
    },
  };

  const data = await gcFetch<{ redirect_flows: { id: string; redirect_url: string } }>(
    "/redirect_flows",
    { method: "POST", body: JSON.stringify(payload) }
  );

  return NextResponse.redirect(data.redirect_flows.redirect_url);
}
