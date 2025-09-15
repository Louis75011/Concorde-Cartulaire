import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { collaborateurs, affectations, clients } from '@/server/db/schema';
import { eq, ilike, or, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() || '';
  const where = q ? or(
    ilike(collaborateurs.nom, `%${q}%`),
    ilike(collaborateurs.email, `%${q}%`),
    ilike(collaborateurs.role, `%${q}%`)
  ) : undefined;

  const base = await db.select().from(collaborateurs).where(where as any).orderBy(desc(collaborateurs.id)).limit(300);

  const rows = [];
  for (const c of base) {
    const affs = await db
      .select({ client: clients.nom })
      .from(affectations)
      .innerJoin(clients, eq(affectations.client_id, clients.id))
      .where(eq(affectations.collaborateur_id, c.id));
    rows.push({
      id: c.id,
      nom: c.nom,
      email: c.email,
      role: c.role,
      clients: affs.map(a=>a.client).join(', '),
    });
  }
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const nom = (body.nom||'').trim();
  const email = (body.email||'').trim();
  const role = (body.role||'').trim();
  if (!nom || !email) return NextResponse.json({ error:'nom et email requis' }, { status:400 });

  const [row] = await db.insert(collaborateurs).values({ nom, email, role }).returning({ id: collaborateurs.id });
  return NextResponse.json({ ok:true, id: row.id });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error:'id requis' }, { status:400 });
  await db.delete(collaborateurs).where(eq(collaborateurs.id, id));
  return NextResponse.json({ ok:true });
}
