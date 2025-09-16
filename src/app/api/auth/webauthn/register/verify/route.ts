// src/app/api/auth/webauthn/register/verify/route.ts
import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { db } from "@/server/db/client";
import { credentials } from "@/server/db/schema";
import { createSession } from "@/server/auth/session";
import { toBase64Url } from "@/server/webauthn/codec";

// export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.json();
  const stateStr = (await cookies()).get("webauthn_reg_state")?.value;
  if (!stateStr) return NextResponse.json({ ok: false, error: "no-state" }, { status: 400 });

  const { challenge, uid } = JSON.parse(stateStr);

  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: process.env.WEBAUTHN_ORIGIN!,
    expectedRPID: process.env.WEBAUTHN_RP_ID!,
  });

  if (!verified || !registrationInfo) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { credentialID, credentialPublicKey, counter } = registrationInfo;

  await db.insert(credentials).values({
    userId: Number(uid),
    // @ts-ignore
    credentialID: toBase64Url(credentialID),         // string
    publicKey: toBase64Url(credentialPublicKey),     // string
    counter,
  }).onConflictDoNothing();

  await createSession(Number(uid));
  return NextResponse.json({ ok: true });
}
