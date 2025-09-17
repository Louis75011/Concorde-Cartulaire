// src\app\api\auth\webauthn\auth\options\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { startAuth } from '@/lib/auth/webauthn-server';
import { setAuthChallenge } from '@/lib/auth/challenges';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const { user, options } = await startAuth(email);
  setAuthChallenge(email, options.challenge);
  return NextResponse.json({ userId: user.id, options });
}
