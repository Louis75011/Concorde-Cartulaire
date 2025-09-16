import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { clients } from '@/server/db/schema';
import { desc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  const rows = await db.select({ id: clients.id, nom: clients.nom }).from(clients).orderBy(desc(clients.id)).limit(500);
  return NextResponse.json(rows);
}
