// src/app/(auth)/webauthn/registration/start/route.ts
import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto"; // bien utiliser node:crypto

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await req.json();
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u) return NextResponse.json({ error: "user not found" }, { status: 404 });

  const existing = await db
    .select()
    .from(user_passkeys)
    .where(eq(user_passkeys.user_id, userId));

  const opts = await generateRegistrationOptions({
    rpName: "Concorde Cartulaire",
    rpID: process.env.WEBAUTHN_RP_ID!, // ex: concorde-cartulaire.vercel.app

    // ✅ userID doit être un Uint8Array
    userID: new Uint8Array(randomBytes(16)),

    userName: u.email,
    attestationType: "none",

    // ✅ excludeCredentials.id doit être un Uint8Array
    // @ts-ignore
    excludeCredentials: existing.map((c) => ({
      id: new Uint8Array(Buffer.from(c.credential_id, "base64url")),
      type: "public-key" as const,
    })),
  });

  // Debug log
  console.log("[WEBAUTHN registration opts]", JSON.stringify(opts, null, 2));

  // stocker le challenge
  await db.insert(auth_challenges).values({
    user_id: u.id,
    type: "webauthn-reg",
    challenge: opts.challenge,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  return NextResponse.json(opts);
}
