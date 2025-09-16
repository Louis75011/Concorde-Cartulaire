import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { db } from "@/server/db/client";
import { user_totp } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { unseal } from '@/lib/crypto';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { token } = await req.json();
  const rows = await db
    .select()
    .from(user_totp)
    .where(eq(user_totp.user_id, session.uid))
    .orderBy(desc(user_totp.id))
    .limit(1);

  if (!rows.length) return new NextResponse('No TOTP', { status: 404 });

  const secret = unseal(rows[0].secret_enc);
  const ok = authenticator.check(token, secret);
  if (!ok) return new NextResponse('Invalid TOTP', { status: 400 });

  await db.update(user_totp).set({ enabled: true }).where(eq(user_totp.id, rows[0].id));
  return NextResponse.json({ ok: true });
}
