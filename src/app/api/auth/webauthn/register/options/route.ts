import { NextRequest, NextResponse } from 'next/server';
import { startRegistration } from '@/lib/auth/webauthn-server';
import { setRegChallenge } from '@/lib/auth/challenges';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const { user, options } = await startRegistration(email);
  setRegChallenge(email, options.challenge);
  return NextResponse.json({ userId: user.id, options });
}
