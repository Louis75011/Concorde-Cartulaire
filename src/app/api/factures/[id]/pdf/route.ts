import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { factures, contrats, clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { renderInvoicePDF } from "@/server/pdf/invoice";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // ← params doit être “await”
) {
  const { id } = await ctx.params;
  const num = Number(id);

  const row = (
    await db
      .select({
        id: factures.id,
        date_emission: factures.date_emission,
        montant_ttc: factures.montant_ttc,
        client_nom: clients.nom,
        client_email: clients.email,
      })
      .from(factures)
      .leftJoin(contrats, eq(contrats.id, factures.contrat_id))
      .leftJoin(clients, eq(clients.id, contrats.client_id))
      .where(eq(factures.id, num))
      .limit(1)
  )[0];

  if (!row) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const pdf = await renderInvoicePDF({
    id: row.id,
    clientNom: row.client_nom ?? "—",
    clientEmail: row.client_email ?? "—",
    dateEmission: row.date_emission,
    montantTTC: Number(row.montant_ttc),
  });

//   @ts-ignore
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="facture-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
