import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db/client';
import { prelevements } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const secret = process.env.GOCARDLESS_WEBHOOK_SECRET;
  if (!secret) return new NextResponse('Missing GOCARDLESS_WEBHOOK_SECRET', { status: 500 });

  const raw = await req.text();
  const signature = req.headers.get('Webhook-Signature');
  if (!signature) return new NextResponse('Missing signature', { status: 400 });

  const computed = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
  if (computed !== signature) return new NextResponse('Invalid signature', { status: 400 });

  const payload = JSON.parse(raw);
  for (const ev of payload.events ?? []) {
    const provider_event_id = ev.id;
    const statut = ev?.details?.cause === 'payment_paid' || ev.action === 'paid' ? 'paid'
                  : ev.action === 'failed' ? 'failed'
                  : ev.action === 'cancelled' ? 'cancelled' : 'submitted';

    const found = await db.select().from(prelevements).where(eq(prelevements.provider_event_id, provider_event_id)).limit(1);
    if (found.length) {
      await db.update(prelevements).set({ statut }).where(eq(prelevements.id, found[0].id));
    } else {
      await db.insert(prelevements).values({
        facture_id: 0,
        provider_id: 1,
        montant: '0.00',
        devise: 'EUR',
        statut,
        provider_event_id,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
