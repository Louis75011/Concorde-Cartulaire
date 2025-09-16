// src/app/api/auth/webauthn/register/options/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { fromBase64Url, toBase64Url } from "@/server/webauthn/codec";

export const runtime = "nodejs"; // on force Node (crypto)

export async function POST(req: Request) {
  try {
    const { email, displayName } = await req.json();

    // 1) upsert user
    let user = (
      await db.select().from(users).where(eq(users.email, email)).limit(1)
    )[0];

    if (!user) {
      const webId = toBase64Url(randomBytes(32)); // 32 bytes (<=64)
      const ins = await db
        .insert(users)
        .values({
          email,
          display_name: displayName ?? email.split("@")[0],
          webauthn_user_id: webId,
          is_admin: false,
        })
        .returning();
      user = ins[0];
    }

    // 2) si user existant sans webauthn_user_id → on le génère
    if (!user.webauthn_user_id) {
      const webId = toBase64Url(randomBytes(32));
      const upd = await db
        .update(users)
        .set({ webauthn_user_id: webId })
        .where(eq(users.id, user.id))
        .returning();
      user = upd[0];
    }

    // 3) construire les options (⚠️ userID en bytes, pas string)
    const preferPlatform = process.env.WEBAUTHN_PREFER_PLATFORM === "true";
    // si user.webauthn_user_id est vide, en créer un (32 bytes)
    if (!user.webauthn_user_id) {
      const webId = toBase64Url(randomBytes(32));
      const upd = await db
        .update(users)
        .set({ webauthn_user_id: webId })
        .where(eq(users.id, user.id))
        .returning();
      user = upd[0];
    }

    const options = await generateRegistrationOptions({
      rpName: process.env.WEBAUTHN_RP_NAME!,
      rpID: process.env.WEBAUTHN_RP_ID!,
      userID: fromBase64Url(user.webauthn_user_id!), // bytes (≤64)
      userName: user.email,
      userDisplayName: user.display_name ?? user.email,
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: preferPlatform ? "platform" : undefined,
        residentKey: "required",
        userVerification: "required",
      },
    });

    // 4) stocker challenge + uid
    (await cookies()).set(
      "webauthn_reg_state",
      JSON.stringify({
        challenge: options.challenge,
        uid: user.id,
      }),
      { httpOnly: true, sameSite: "strict", path: "/", maxAge: 300 }
    );

    return NextResponse.json({ options });
  } catch (e) {
    console.error("register/options error:", e);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
