import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { factures, contrats, clients } from '@/server/db/schema';
import { eq, ilike, or, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  const where = q
    ? or(ilike(clients.nom, `%${q}%`), ilike(contrats.titre, `%${q}%`), ilike(factures.statut_paiement, `%${q}%`))
    : undefined;

  const rows = await db
    .select({
      id: factures.id,
      contrat_id: factures.contrat_id,
      client: clients.nom,
      contrat: contrats.titre,
      emission: factures.date_emission,
      echeance: factures.date_echeance,
      ht: factures.montant_ht,
      ttc: factures.montant_ttc,
      statut: factures.statut_paiement,
    })
    .from(factures)
    .innerJoin(contrats, eq(factures.contrat_id, contrats.id))
    .innerJoin(clients, eq(contrats.client_id, clients.id))
    .where(where as any)
    .orderBy(desc(factures.id))
    .limit(300);

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const contrat_id = Number(body.contrat_id);
  const montant_ht = Number(body.montant_ht);
  const tva = body.tva != null ? Number(body.tva) : 20.0;
  const date_echeance = body.date_echeance ? new Date(body.date_echeance) : null;

  if (!contrat_id || isNaN(montant_ht)) {
    return NextResponse.json({ error:'contrat_id et montant_ht requis' }, { status:400 });
  }
  const montant_ttc = Math.round((montant_ht * (1 + tva/100)) * 100) / 100;

  const [row] = await db.insert(factures).values({
    contrat_id,
    date_echeance: date_echeance || undefined,
    montant_ht: String(montant_ht),
    tva: String(tva),
    montant_ttc: String(montant_ttc),
    statut_paiement: 'envoyee',
  }).returning({ id: factures.id });

  return NextResponse.json({ ok:true, id: row.id });
}
