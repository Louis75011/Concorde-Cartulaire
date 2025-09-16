import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys, users } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await req.json();
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u) return NextResponse.json({ error: "user not found" }, { status: 404 });

  const existing = await db.select().from(user_passkeys).where(eq(user_passkeys.user_id, userId));

  const opts = await generateRegistrationOptions({
    rpName: "Concorde Cartulaire",
    rpID: process.env.RP_ID!,
    // @ts-ignore
    userID: String(u.id),
    userName: u.email,
    attestationType: "none",
    // @ts-ignore
    excludeCredentials: existing.map((c) => ({ id: Buffer.from(c.credential_id, "base64url"), type: "public-key" })),
  });

  // stocker le challenge
  await db.insert(auth_challenges).values({
    user_id: u.id,
    type: "webauthn-reg",
    challenge: opts.challenge,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  return NextResponse.json(opts);
}
