import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys, users } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { signSession, sessionCookie } from "@/server/auth/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId, response } = await req.json();

  // Récupérer le dernier challenge
  const [ch] = await db
    .select()
    .from(auth_challenges)
    .where(eq(auth_challenges.user_id, userId))
    .orderBy(desc(auth_challenges.id))
    .limit(1);

  if (!ch || ch.type !== "webauthn-auth") {
    return NextResponse.json({ error: "challenge missing" }, { status: 400 });
  }

  // Charger l’utilisateur et la clé
  const [u] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const [cred] = await db
    .select()
    .from(user_passkeys)
    .where(eq(user_passkeys.user_id, userId))
    .limit(1);

  if (!u || !cred) {
    return NextResponse.json({ error: "no credential" }, { status: 404 });
  }

  // Vérification WebAuthn
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: ch.challenge,
    expectedOrigin: process.env.ORIGIN!,
    expectedRPID: process.env.RP_ID!,
    authenticator: {
      // @ts-ignore
      credentialID: new Uint8Array(
        Buffer.from(cred.credential_id, "base64url")
      ),
      credentialPublicKey: new Uint8Array(
        Buffer.from(cred.public_key, "base64")
      ),
      counter: cred.counter,
      transports: cred.transports?.split(",") as any,
    },
  });

  if (!verification.verified) {
    return NextResponse.json({ error: "auth failed" }, { status: 401 });
  }

  // maj compteur éventuelle
  const newCounter =
    verification.authenticationInfo?.newCounter ?? cred.counter;
  await db.execute(
    `update user_passkeys set counter=${newCounter} where id=${cred.id}`
  );

  // Émettre un cookie de session
  const token = await signSession({
    uid: u.id,
    email: u.email,
    admin: !!u.is_admin,
  });
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", sessionCookie(token));
  return res;
}
