// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user.length) {
    return NextResponse.json({ error: "Utilisateur inconnu" }, { status: 401 });
  }

  // Vérif hash bcrypt
  //   @ts-ignore
  const valid = await bcrypt.compare(password, user[0].password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Mot de passe invalide" },
      { status: 401 }
    );
  }

  const token = await new SignJWT({ uid: user[0].id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set("sid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
