import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  cookies().set('sid', token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });
}

export async function getSession(): Promise<{ uid: number } | null> {
  const cookie = cookies().get('sid')?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, secret);
    return { uid: Number(payload.uid) };
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set('sid', '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 });
}
