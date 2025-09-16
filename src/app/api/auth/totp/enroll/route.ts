import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { seal } from '@/lib/crypto';
import { db } from "@/server/db/client";
import { user_totp } from '@/db/schema';
import { getSession } from '@/lib/session';

export async function POST() {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(String(session.uid), 'Cartulaire', secret);
  const svg = await QRCode.toString(otpauth, { type: 'svg' });

  const enc = seal(secret);
  await db.insert(user_totp).values({ user_id: session.uid, secret_enc: enc, enabled: false });

  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
