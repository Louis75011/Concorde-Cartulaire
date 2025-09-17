// src/app/api/webauthn/authentication/start/route.ts
import { NextResponse } from "next/server";
import { cookies as getCookies } from "next/headers";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { auth_challenges, user_passkeys, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

type Body = { email: string };

export async function POST(req: Request) {
  const { email }: Body = await req.json();
  if (!email)
    return NextResponse.json({ error: "email requis" }, { status: 400 });

  const [u] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!u)
    return NextResponse.json({ error: "user not found" }, { status: 404 });

  const passkeys = await db
    .select()
    .from(user_passkeys)
    .where(eq(user_passkeys.user_id, u.id));
  if (!passkeys.length) {
    return NextResponse.json(
      { error: "no passkeys for user" },
      { status: 404 }
    );
  }

  const opts = await generateAuthenticationOptions({
    rpID: process.env.WEBAUTHN_RP_ID!,
    userVerification: "preferred",
    // @ts-ignore
    allowCredentials: passkeys.map((pk) => ({
      id: new Uint8Array(Buffer.from(pk.credential_id, "base64url")),
      type: "public-key" as const,
      // transports: pk.transports?.split(",") as any,
    })),
  });

  await db.insert(auth_challenges).values({
    user_id: u.id,
    type: "webauthn-auth",
    challenge: opts.challenge,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  const jar = await getCookies();
  jar.set("webauthn_auth_uid", String(u.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
    secure: true,
  });

  return NextResponse.json(opts);
}
