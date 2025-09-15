import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthResponse } from '@/lib/auth/webauthn';
import { getChallenge } from '../options/route';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const expectedChallenge = getChallenge();
  if (!expectedChallenge) {
    return new NextResponse('Challenge manquant', { status: 400 });
  }
  // ⚠️ À implémenter : vérification réelle avec la DB
  return new NextResponse('OK (stub) - implémentez la vérification contre la DB');
}
