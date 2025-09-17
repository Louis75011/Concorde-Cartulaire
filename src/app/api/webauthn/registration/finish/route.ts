// src/app/api/webauthn/registration/finish/route.ts
import { NextResponse } from "next/server";
import { cookies as getCookies } from "next/headers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys } from "@/server/db/schema";
import { and, eq, gt, desc } from "drizzle-orm";

export const runtime = "nodejs";

const toB64Url = (buf: ArrayBuffer | Uint8Array) =>
  Buffer.from(buf as any).toString("base64url");

export async function POST(req: Request) {
  const body = (await req.json()) as RegistrationResponseJSON;

  const jar = await getCookies();
  const uid = jar.get("webauthn_reg_uid")?.value;
  if (!uid)
    return NextResponse.json({ error: "no uid cookie" }, { status: 400 });

  const [ch] = await db
    .select()
    .from(auth_challenges)
    .where(
      and(
        eq(auth_challenges.user_id, Number(uid)),
        eq(auth_challenges.type, "webauthn-reg"),
        gt(auth_challenges.expires_at, new Date())
      )
    )
    .orderBy(desc(auth_challenges.id))
    .limit(1);
  if (!ch)
    return NextResponse.json({ error: "no valid challenge" }, { status: 400 });

  try {
    const origins =
      process.env.WEBAUTHN_ORIGIN?.split(",").map((s) => s.trim()) ?? [];
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: ch.challenge,
      expectedRPID: process.env.WEBAUTHN_RP_ID!,
      expectedOrigin: origins.length ? origins : process.env.WEBAUTHN_ORIGIN!,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "verification_failed" },
        { status: 400 }
      );
    }

    const { credentialID, credentialPublicKey, counter } =
      verification.registrationInfo;
    const transports = (body.response as any)?.transports;
    const transportsCsv = Array.isArray(transports)
      ? transports.join(",")
      : null;

    await db.insert(user_passkeys).values({
      user_id: Number(uid),
      //   @ts-ignore
      credential_id: toB64Url(credentialID),
      public_key: Buffer.from(credentialPublicKey).toString("base64url"),
      counter,
      transports: transportsCsv ?? undefined,
    });

    const jar2 = await getCookies();
    jar2.set("webauthn_reg_uid", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: true,
    });

    console.log("[WEBAUTHN /registration/finish] OK uid=", uid);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes("duplicate key") || msg.includes("unique")) {
      return NextResponse.json({ ok: true, note: "credential déjà connue" });
    }
    console.error("[WEBAUTHN /registration/finish] error:", msg);
    return NextResponse.json(
      { error: "exception", details: msg },
      { status: 500 }
    );
  }
}
