import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";

export async function POST() {
  const options = await generateAuthenticationOptions({
  rpID: process.env.WEBAUTHN_RP_ID!,
    userVerification: "required", // ← demande PIN/biométrie
    // allowCredentials: [] // vide → usernameless; le navigateur propose “utiliser un téléphone”
    // (certains navigateurs exposent aussi hints:['client-device'], non standardisé partout)
    // userVerification: "preferred",
  });

  (await cookies()).set("webauthn_auth_chal", options.challenge, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 300,
  });

  return NextResponse.json({ options });
}
