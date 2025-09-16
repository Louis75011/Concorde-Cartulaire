import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { contrats, clients } from '@/server/db/schema';
import { eq, ilike, or, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() || '';
  const where = q ? or(ilike(clients.nom, `%${q}%`), ilike(contrats.titre, `%${q}%`)) : undefined;

  const rows = await db.select({
    id: contrats.id,
    client_id: contrats.client_id,
    client: clients.nom,
    titre: contrats.titre,
    cree_le: contrats.cree_le,
  })
  .from(contrats)
  .innerJoin(clients, eq(contrats.client_id, clients.id))
  .where(where as any)
  .orderBy(desc(contrats.id))
  .limit(200);

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const client_id = Number(body.client_id);
  const titre = String(body.titre||'').trim();
  if (!client_id || !titre) return NextResponse.json({ error:'client_id et titre requis' }, { status:400 });

  const [row] = await db.insert(contrats).values({ client_id, titre }).returning({ id: contrats.id });
  return NextResponse.json({ ok:true, id: row.id });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error:'id requis' }, { status:400 });
  await db.delete(contrats).where(eq(contrats.id, id));
  return NextResponse.json({ ok:true });
}
