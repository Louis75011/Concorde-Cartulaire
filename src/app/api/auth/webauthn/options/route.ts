import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/webauthn';
import { setChallenge } from '@/lib/auth/challengeStore';

export async function POST() {
  const opts = await authOptions();
  setChallenge(opts.challenge);
  return NextResponse.json({ options: opts });
}
