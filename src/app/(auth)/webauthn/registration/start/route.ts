// src/app/(auth)/webauthn/registration/start/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

type Body = { email: string; displayName?: string };

function getWebAuthnConfig() {
  const rpID = process.env.WEBAUTHN_RP_ID!;
  const origin = process.env.WEBAUTHN_ORIGIN!;
  if (!rpID || !origin) {
    throw new Error("WEBAUTHN_RP_ID/WEBAUTHN_ORIGIN manquants");
  }
  return { rpID, origin };
}

console.log("[DEBUG /start] ENV", {
  rpID: process.env.WEBAUTHN_RP_ID,
  origin: process.env.WEBAUTHN_ORIGIN,
});

export async function POST(req: Request) {
  try {
    const { email, displayName }: Body = await req.json();
    if (!email) {
      return NextResponse.json({ error: "email requis" }, { status: 400 });
    }

    // 1) upsert utilisateur
    let [u] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!u) {
      const ins = await db
        .insert(users)
        // @ts-ignore selon ton schéma
        .values({ email, nom_affichage: displayName || email.split("@")[0] })
        .returning();
      u = ins[0];
    }

    // 2) récupérer passkeys existants
    const existing = await db
      .select()
      .from(user_passkeys)
      .where(eq(user_passkeys.user_id, u.id));

    const { rpID } = getWebAuthnConfig();

    // 3) options WebAuthn
    const opts = await generateRegistrationOptions({
      rpName: "Concorde Cartulaire",
      rpID,
      userID: new Uint8Array(randomBytes(16)), // identifiant stable serait mieux à terme
      userName: u.email,
      attestationType: "none",
      // @ts-ignore
      excludeCredentials: existing.map((c) => ({
        id: new Uint8Array(Buffer.from(c.credential_id, "base64url")),
        type: "public-key" as const,
      })),
      authenticatorSelection: { userVerification: "preferred" },
    });

    // 4) stocker le challenge
    await db.insert(auth_challenges).values({
      user_id: u.id,
      type: "webauthn-reg",
      challenge: opts.challenge,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 5) cookie httpOnly pour liaison avec /finish
    const jar = cookies();
    // @ts-ignore (Next.js bug TS)
    jar.set("webauthn_reg_uid", String(u.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
      secure: true,
    });

    console.log("[WEBAUTHN /registration/start]", {
      rpID: opts.rp.id,
      userName: opts.user.name,
      challengeLen: opts.challenge.length,
    });

    return NextResponse.json(opts);
  } catch (e: any) {
    console.error("[/registration/start] FAIL:", e);
    return NextResponse.json(
      { error: "exception", details: String(e?.message || e) },
      { status: 500 }
    );
  }
}
