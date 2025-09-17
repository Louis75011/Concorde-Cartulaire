// src/app/api/webauthn/registration/start/route.ts
import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

type Body = { email: string; displayName?: string };

function needEnv() {
  const rpID = process.env.WEBAUTHN_RP_ID!;
  const origin = process.env.WEBAUTHN_ORIGIN!;
  if (!rpID || !origin) throw new Error("WEBAUTHN_RP_ID/WEBAUTHN_ORIGIN manquants");
  return { rpID, origin };
}

export async function POST(req: Request) {
  try {
    const { email, displayName }: Body = await req.json();
    if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 });
    const { rpID } = needEnv();

    // 1) upsert utilisateur
    let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!u) {
      const ins = await db.insert(users).values({
        email,
        display_name: displayName || email.split("@")[0],
      }).returning();
      u = ins[0];
    }

    // 2) handle stable
    if (!u.webauthn_user_id) {
      const handle = randomBytes(16).toString("base64url"); // ✅ stocké en base en string
      await db.update(users).set({ webauthn_user_id: handle }).where(eq(users.id, u.id));
      u.webauthn_user_id = handle as any;
    }

    // 3) exclude credentials
    const existing = await db.select().from(user_passkeys).where(eq(user_passkeys.user_id, u.id));

    const opts = await generateRegistrationOptions({
      rpName: "Concorde Cartulaire",
      rpID,
      userID: new Uint8Array(Buffer.from(u.webauthn_user_id!, "base64url")),
      userName: u.email,
      attestationType: "none",
      // @ts-ignore
      excludeCredentials: existing.map(c => ({
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

    const res = NextResponse.json(opts);
    // poser le cookie sur la réponse
    res.cookies.set("webauthn_reg_uid", String(u.id), {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 10 * 60, secure: true,
    });
    return res;
  } catch (e: any) {
    console.error("[webauthn/registration/start] ERROR:", e?.stack || e);
    return NextResponse.json({ error: "start_failed", details: String(e) }, { status: 500 });
  }
}
