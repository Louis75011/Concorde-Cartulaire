import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthResponse } from '@/lib/auth/webauthn';
import { getChallenge } from '@/lib/auth/challengeStore';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const expectedChallenge = getChallenge();

  if (!expectedChallenge) {
    return new NextResponse('Challenge manquant', { status: 400 });
  }

  return new NextResponse('OK (stub) - implémentez la vérification contre la DB');
}
