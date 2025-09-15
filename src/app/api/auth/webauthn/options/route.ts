import { NextResponse } from 'next/server';
import { authOptions } from '@/src/lib/auth/webauthn';

let lastChallenge = '';
export async function POST() {
  const opts = authOptions();
  lastChallenge = opts.challenge;
  return NextResponse.json({ options: opts });
}

export function getChallenge() { return lastChallenge; }
