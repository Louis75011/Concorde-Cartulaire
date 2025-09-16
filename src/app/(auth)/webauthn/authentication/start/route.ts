import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await req.json();
  const creds = await db.select().from(user_passkeys).where(eq(user_passkeys.user_id, userId));

  const opts = await generateAuthenticationOptions({
    rpID: process.env.RP_ID!,
    // @ts-ignore
    allowCredentials: creds.map((c) => ({
      id: Buffer.from(c.credential_id, "base64url"),
      type: "public-key",
    })),
    userVerification: "preferred",
  });

  await db.insert(auth_challenges).values({
    user_id: userId,
    type: "webauthn-auth",
    challenge: opts.challenge,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  return NextResponse.json(opts);
}
