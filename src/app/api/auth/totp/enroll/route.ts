import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { seal } from '@/lib/crypto';
import { db } from "@/server/db/client";
import { user_totp } from '@/db/schema';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST() {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(String(session.uid), 'Cartulaire', secret);
  const svg = await QRCode.toString(otpauth, { type: 'svg' });

  const enc = seal(secret);

  // upsert: si l’utilisateur relance un enrôlement, on remplace le secret et on désactive
  await db.execute(`
    insert into user_totp (user_id, secret_enc, enabled)
    values (${session.uid}, ${enc}, false)
    on conflict (user_id) do update set secret_enc = excluded.secret_enc, enabled=false
  `);

  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
