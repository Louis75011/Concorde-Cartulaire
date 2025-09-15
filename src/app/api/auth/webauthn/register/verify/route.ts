import { NextRequest, NextResponse } from 'next/server';
import { finishRegistration } from '@/lib/auth/webauthn-server';
import { getRegChallenge } from '@/lib/auth/challenges';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email: string = body.email;
  const userId: number = body.userId;
  const expected = getRegChallenge(email);
  if (!expected) return new NextResponse('Challenge manquant', { status: 400 });
  const verification = await finishRegistration(userId, expected, body.response);
  if (verification.verified) {
    await createSession(userId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
