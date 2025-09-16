import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
const MAX_AGE = 60 * 60 * 8; // 8h

export type Session = { uid: number; email: string; admin?: boolean };

export async function signSession(s: Session) {
  return await new SignJWT(s as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as any as Session;
}

export function sessionCookie(token: string) {
  // cookie sécurisé
  return `cc_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie() {
  return `cc_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
