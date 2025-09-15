import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sign_requests, documents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const event = payload.event || payload.status;
  const external_id = payload.submission_id || payload.id;
  const download_url = payload.download_url;

  const newStatut = event === 'completed' ? 'completed'
                  : event === 'declined' ? 'declined'
                  : 'sent';

  const updated = await db.update(sign_requests).set({ statut: newStatut }).where(eq(sign_requests.external_id, external_id)).returning();
  if (download_url && updated.length) {
    await db.insert(documents).values({ client_id: null as any, url: download_url, title: 'Contrat signé', kind: 'contrat' as any });
  }
  return NextResponse.json({ ok: true });
}
