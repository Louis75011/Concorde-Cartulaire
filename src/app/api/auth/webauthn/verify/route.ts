import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthResponse } from '@/src/lib/auth/webauthn';
import { getChallenge } from '../options/route';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // In real app, resolve credential by body.id -> fetch publicKey & counter from DB
  // Here we accept all for demo purpose
  const expectedChallenge = getChallenge();
  if (!expectedChallenge) return new NextResponse('Challenge manquant', { status: 400 });
  // Skipping actual verification due to missing stored credential
  return new NextResponse('OK (stub) - implémentez la vérification contre la DB');
}
