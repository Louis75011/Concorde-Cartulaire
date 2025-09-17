import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "@/server/db/client";
import { factures } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { gc } from "@/server/payments/gocardless-client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("invoice_id");
  const clientEmail = url.searchParams.get("client_email") ?? "";
  const clientNom = url.searchParams.get("client_nom") ?? "";

  if (!invoiceId) return NextResponse.json({ error: "invoice_id manquant" }, { status: 400 });
  if (!process.env.APP_BASE_URL)
    return NextResponse.json({ error: "APP_BASE_URL manquant" }, { status: 500 });

  const inv = (await db.select().from(factures).where(eq(factures.id, Number(invoiceId))).limit(1))[0];
  if (!inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const sessionToken = crypto.randomUUID();

  const flow = await gc.redirectFlows.create({
    description: `Facture #${invoiceId}`,
    session_token: sessionToken,
    success_redirect_url:
      `${process.env.APP_BASE_URL}/api/payments/gc/redirect/complete?invoice_id=${invoiceId}`,
    prefilled_customer: {
      given_name: clientNom || "Client",
      email: clientEmail || "demo@example.com",
    },
    metadata: { invoice_id: String(invoiceId) },
  });

  (await cookies()).set("gc_session", sessionToken, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 10 * 60,
  });

  return NextResponse.redirect(flow.redirect_url);
}
