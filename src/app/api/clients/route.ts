import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { clients } from '@/db/schema';
import { ilike, asc, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const order = searchParams.get('order') || 'id.desc';
  const [_, dir] = order.split('.');
  const where = q ? ilike(clients.nom, `%${q}%`) : undefined as any;
  const rows = await db.select().from(clients).where(where).orderBy(dir === 'desc' ? desc(clients.id) : asc(clients.id)).limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const inserted = await db.insert(clients).values({
    nom: body.nom, email: body.email, tel: body.tel, entreprise: body.entreprise, secteur: body.secteur
  }).returning();
  return NextResponse.json(inserted[0], { status: 201 });
}
