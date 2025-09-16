import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { clients, contrats, factures, prestataires, collaborateurs } from '@/server/db/schema';
import { count } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  // Totaux dynamiques
  const totalClients = await db.select({ count: count() }).from(clients);
  const totalContrats = await db.select({ count: count() }).from(contrats);
  const totalFactures = await db.select({ count: count() }).from(factures);
  const totalPrestataires = await db.select({ count: count() }).from(prestataires);
  const totalCollabs = await db.select({ count: count() }).from(collaborateurs);

  // Activités (semi-dur, pourra être rendu dynamique plus tard)
  const activites = [
    "Facture #1023 payée par Société Dupont",
    "Nouveau contrat signé avec Clinique Pégase",
    "Ajout d’un collaborateur (Anne Durand)",
  ];

  // Fusionner dans un seul JSON
  return NextResponse.json({
    clients: totalClients[0].count,
    contrats: totalContrats[0].count,
    factures: totalFactures[0].count,
    prestataires: totalPrestataires[0].count,
    collaborateurs: totalCollabs[0].count,
    activites,
  });
}
