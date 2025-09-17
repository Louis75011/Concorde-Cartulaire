// src\app\api\factures\options\route.ts
import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { contrats, clients } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  const rows = await db
    .select({ id: contrats.id, titre: contrats.titre, client: clients.nom })
    .from(contrats)
    .innerJoin(clients, eq(contrats.client_id, clients.id))
    .orderBy(desc(contrats.id))
    .limit(500);
  return NextResponse.json(rows);
}
