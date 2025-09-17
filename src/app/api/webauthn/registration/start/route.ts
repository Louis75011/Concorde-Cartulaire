// src/app/api/webauthn/registration/start/route.ts
import { NextResponse } from "next/server";
import { cookies as getCookies } from "next/headers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

type Body = { email: string; displayName?: string };

function getCfg() {
  const rpID = process.env.WEBAUTHN_RP_ID!;
  const origin = process.env.WEBAUTHN_ORIGIN!;
  if (!rpID || !origin)
    throw new Error("WEBAUTHN_RP_ID/WEBAUTHN_ORIGIN manquants");
  return { rpID, origin };
}

export async function POST(req: Request) {
  const { email, displayName }: Body = await req.json();
  if (!email)
    return NextResponse.json({ error: "email requis" }, { status: 400 });

  // upsert user
  let [u] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!u) {
    const ins = await db
      .insert(users)
      .values({ email, display_name: displayName || email.split("@")[0] })
      .returning();
    u = ins[0];
  }

  // user handle stable
  if (!u.webauthn_user_id) {
    const handle = Buffer.from(randomBytes(16)).toString("base64url");
    await db
      .update(users)
      .set({ webauthn_user_id: handle })
      .where(eq(users.id, u.id));
    u.webauthn_user_id = handle as any;
  }

  const existing = await db
    .select()
    .from(user_passkeys)
    .where(eq(user_passkeys.user_id, u.id));

  const { rpID } = getCfg();

  const opts = await generateRegistrationOptions({
    rpName: "Concorde Cartulaire",
    rpID,
    userID: new Uint8Array(Buffer.from(u.webauthn_user_id!, "base64url")),
    userName: u.email,
    attestationType: "none",
    // @ts-ignore
    excludeCredentials: existing.map((c) => ({
      id: new Uint8Array(Buffer.from(c.credential_id, "base64url")),
      type: "public-key" as const,
    })),
    authenticatorSelection: { userVerification: "preferred" },
  });

  await db.insert(auth_challenges).values({
    user_id: u.id,
    type: "webauthn-reg",
    challenge: opts.challenge,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  const jar = await getCookies();
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
}
