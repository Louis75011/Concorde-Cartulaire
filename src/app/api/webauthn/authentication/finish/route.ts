// src/app/api/webauthn/authentication/finish/route.ts
import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys } from "@/server/db/schema";
import { and, eq, gt, desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as AuthenticationResponseJSON;

  const uid = req.headers.get("cookie")?.match(/webauthn_auth_uid=([^;]+)/)?.[1];
  if (!uid) return NextResponse.json({ error: "no uid cookie" }, { status: 400 });

  const [ch] = await db.select().from(auth_challenges)
    .where(and(
      eq(auth_challenges.user_id, Number(uid)),
      eq(auth_challenges.type, "webauthn-auth"),
      gt(auth_challenges.expires_at, new Date()),
    ))
    .orderBy(desc(auth_challenges.id)).limit(1);
  if (!ch) return NextResponse.json({ error: "no valid challenge" }, { status: 400 });

  const credIdB64url = Buffer.from(new Uint8Array((body.rawId as any) ?? []).buffer).toString("base64url");
  const [pk] = await db.select().from(user_passkeys)
    .where(and(eq(user_passkeys.user_id, Number(uid)), eq(user_passkeys.credential_id, credIdB64url)))
    .limit(1);
  if (!pk) return NextResponse.json({ error: "credential not found" }, { status: 404 });

  try {
    const origins = process.env.WEBAUTHN_ORIGIN?.split(",").map(s => s.trim()) ?? [];
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: ch.challenge,
      expectedRPID: process.env.WEBAUTHN_RP_ID!,
      expectedOrigin: origins.length ? origins : process.env.WEBAUTHN_ORIGIN!,
      requireUserVerification: true,
      authenticator: {
        // @ts-ignore
        credentialID: new Uint8Array(Buffer.from(pk.credential_id, "base64url")),
        credentialPublicKey: new Uint8Array(Buffer.from(pk.public_key, "base64url")),
        counter: pk.counter ?? 0,
        transports: pk.transports?.split(",") as any,
      },
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return NextResponse.json({ error: "verification_failed" }, { status: 400 });
    }

    await db.update(user_passkeys)
      .set({ counter: verification.authenticationInfo.newCounter })
      .where(and(eq(user_passkeys.user_id, Number(uid)), eq(user_passkeys.credential_id, pk.credential_id)));

    const res = NextResponse.json({ ok: true });
    res.cookies.set("session_uid", String(uid), {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60, secure: true,
    });
    res.cookies.set("webauthn_auth_uid", "", {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 0, secure: true,
    });
    return res;
  } catch (e: any) {
    console.error("[webauthn/authentication/finish] ERROR:", e?.stack || e);
    return NextResponse.json({ error: "exception", details: String(e) }, { status: 500 });
  }
}
