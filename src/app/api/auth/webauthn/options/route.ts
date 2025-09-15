import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/webauthn';

let lastChallenge = '';

export async function POST() {
  const opts = await authOptions();
  lastChallenge = opts.challenge;
  return NextResponse.json({ options: opts });
}

export function getChallenge() {
  return lastChallenge;
}
