import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId, response } = await req.json();

  const [last] = await db.select().from(auth_challenges)
    .where(eq(auth_challenges.user_id, userId))
    .orderBy(desc(auth_challenges.id))
    .limit(1);

  if (!last || last.type !== "webauthn-reg") {
    return NextResponse.json({ error: "challenge missing" }, { status: 400 });
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: last.challenge,
    expectedOrigin: process.env.ORIGIN!,
    expectedRPID: process.env.RP_ID!,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "verification failed" }, { status: 400 });
  }

  const { credentialID, credentialPublicKey, counter, credentialDeviceType } = verification.registrationInfo;

  await db.insert(user_passkeys).values({
    user_id: userId,
    credential_id: Buffer.from(credentialID).toString("base64url"),
    public_key: Buffer.from(credentialPublicKey).toString("base64"),
    counter,
    transports: (response.response?.transports || []).join(","),
  });

  return NextResponse.json({ ok: true });
}
