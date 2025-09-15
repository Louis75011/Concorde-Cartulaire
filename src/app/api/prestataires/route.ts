import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { prestataires } from '@/server/db/schema';
import { ilike, or, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  const where = q
    ? or(
        ilike(prestataires.type, `%${q}%`),
        ilike(prestataires.statut, `%${q}%`),
        ilike(prestataires.contact_email, `%${q}%`),
        ilike(prestataires.secteur, `%${q}%`)
      )
    : undefined;

  const rows = await db.select().from(prestataires).where(where as any).orderBy(desc(prestataires.id)).limit(300);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const type = (body.type||'').trim();
  if (!type) return NextResponse.json({ error: 'type requis' }, { status:400 });
  const data = {
    type,
    statut: (body.statut||'actif').trim(),
    contact_email: (body.contact_email||null),
    secteur: (body.secteur||null),
  };
  const [row] = await db.insert(prestataires).values(data as any).returning({ id: prestataires.id });
  return NextResponse.json({ ok:true, id: row.id });
}
