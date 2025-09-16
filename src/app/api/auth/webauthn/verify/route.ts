// src/app/api/auth/webauthn/verify/route.ts
import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { credentials } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { createSession } from "@/server/auth/session";
import { fromBase64Url } from "@/server/webauthn/codec";

export async function POST(req: Request) {
  const body = await req.json();
  const challenge = (await cookies()).get("webauthn_auth_chal")?.value;
  if (!challenge) return NextResponse.json({ ok: false, error: "no-challenge" }, { status: 400 });

  const rawIdB64 = body.rawId as string;

  const credRow = (await db.select().from(credentials)
    .where(eq(credentials.credentialID, rawIdB64)).limit(1))[0];

  if (!credRow) {
    return NextResponse.json({ ok: false, error: "unknown-credential" }, { status: 401 });
  }

  const { verified, authenticationInfo } = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: process.env.WEBAUTHN_ORIGIN!,
    expectedRPID: process.env.WEBAUTHN_RP_ID!,
    authenticator: {
      // @ts-ignore
      credentialID: fromBase64Url(credRow.credentialID),
      credentialPublicKey: fromBase64Url(credRow.publicKey),
      counter: credRow.counter,
    },
  });

  if (!verified || !authenticationInfo) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await db.update(credentials)
    .set({ counter: authenticationInfo.newCounter })
    .where(and(eq(credentials.id, credRow.id), eq(credentials.userId, credRow.userId)));

  await createSession(credRow.userId);
  return NextResponse.json({ ok: true });
}
