import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { factures, clients, contrats } from "@/server/db/schema"; // adaptez si besoin
import { eq } from "drizzle-orm";
import { renderInvoicePDF } from "@/server/pdf/invoice";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  const inv = (await db.select().from(factures).where(eq(factures.id, id)).limit(1))[0];
  if (!inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  // On déduit le client via le contrat si votre schéma fonctionne ainsi
  let cli: any = null;
  if ("contrat_id" in inv) {
    const ct = (await db.select().from(contrats).where(eq(contrats.id, inv.contrat_id)).limit(1))[0];
    if (ct?.client_id) {
      cli = (await db.select().from(clients).where(eq(clients.id, ct.client_id)).limit(1))[0];
    }
  }

  const montant = Number(inv.montant_ttc ?? "0");
  const date = inv.date_emission ? new Date(inv.date_emission) : new Date();

  const pdf = await renderInvoicePDF({
    id,
    client: { nom: cli?.nom ?? "Client", email: cli?.email ?? "" },
    date,
    montant,
    lignes: [], // si vous avez des lignes, mappez ici
  });

//   @ts-ignore
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="facture-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
