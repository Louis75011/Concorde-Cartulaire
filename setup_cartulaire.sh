#!/bin/bash
set -e

BASE="src/app"

echo "== Création des dossiers et fichiers API + Pages =="

# CONTRATS
mkdir -p $BASE/contrats $BASE/api/contrats/options
cat > $BASE/api/contrats/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { contrats, clients } from '@/server/db/schema';
import { eq, ilike, or, desc } from 'drizzle-orm';

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
EOF

cat > $BASE/api/contrats/options/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { clients } from '@/server/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const rows = await db.select({ id: clients.id, nom: clients.nom }).from(clients).orderBy(desc(clients.id)).limit(500);
  return NextResponse.json(rows);
}
EOF

# FACTURES
mkdir -p $BASE/factures $BASE/api/factures/options
cat > $BASE/api/factures/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { factures, contrats, clients } from '@/server/db/schema';
import { eq, ilike, or, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() || '';
  const where = q ? or(
    ilike(clients.nom, `%${q}%`),
    ilike(contrats.titre, `%${q}%`),
    ilike(factures.statut_paiement, `%${q}%`)
  ) : undefined;

  const rows = await db.select({
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

  const montant_ttc = Math.round((montant_ht * (1 + tva/100)) * 100)/100;

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

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error:'id requis' }, { status:400 });
  await db.delete(factures).where(eq(factures.id, id));
  return NextResponse.json({ ok:true });
}
EOF

cat > $BASE/api/factures/options/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { contrats, clients } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const rows = await db
    .select({ id: contrats.id, titre: contrats.titre, client: clients.nom })
    .from(contrats)
    .innerJoin(clients, eq(contrats.client_id, clients.id))
    .orderBy(desc(contrats.id))
    .limit(500);
  return NextResponse.json(rows);
}
EOF

# PRESTATAIRES
mkdir -p $BASE/prestataires $BASE/api/prestataires
cat > $BASE/api/prestataires/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { prestataires } from '@/server/db/schema';
import { ilike, or, desc, eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() || '';
  const where = q ? or(
    ilike(prestataires.type, `%${q}%`),
    ilike(prestataires.statut, `%${q}%`),
    ilike(prestataires.contact_email, `%${q}%`),
    ilike(prestataires.secteur, `%${q}%`)
  ) : undefined;

  const rows = await db.select().from(prestataires).where(where as any).orderBy(desc(prestataires.id)).limit(300);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const type = (body.type||'').trim();
  if (!type) return NextResponse.json({ error:'type requis' }, { status:400 });

  const data = {
    type,
    statut: (body.statut||'actif').trim(),
    contact_email: body.contact_email||null,
    secteur: body.secteur||null,
  };
  const [row] = await db.insert(prestataires).values(data as any).returning({ id: prestataires.id });
  return NextResponse.json({ ok:true, id: row.id });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error:'id requis' }, { status:400 });
  await db.delete(prestataires).where(eq(prestataires.id, id));
  return NextResponse.json({ ok:true });
}
EOF

# COLLABORATEURS
mkdir -p $BASE/collaborateurs $BASE/api/collaborateurs
cat > $BASE/api/collaborateurs/route.ts <<'EOF'
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
EOF

echo "== Terminé. Relancez 'pnpm dev' puis testez vos routes /api/* =="

