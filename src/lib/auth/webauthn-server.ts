import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { db } from "@/db/client";
import { users, user_passkeys } from "@/db/schema";
import { eq } from "drizzle-orm";

export const rpID = process.env.WEBAUTHN_RP_ID!;
export const rpName = process.env.WEBAUTHN_RP_NAME!;
export const origin = process.env.WEBAUTHN_ORIGIN!;

export async function startRegistration(email: string) {
  let [u] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!u) {
    const inserted = await db.insert(users).values({ email }).returning();
    u = inserted[0];
  }
  const existing = await db
    .select()
    .from(user_passkeys)
    .where(eq(user_passkeys.user_id, u.id));
  const options = await generateRegistrationOptions({
    rpID,
    rpName,
    userID: new TextEncoder().encode(String(u.id)),
    userName: email,
    attestationType: "none",
    excludeCredentials: existing.map((a) => ({
      id: Buffer.from(a.credential_id, "base64url").toString("base64url"),
      type: "public-key" as const,
    })) as any, // ✅ bypass typage
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });
  return { user: u, options };
}

export async function finishRegistration(
  userId: number,
  expectedChallenge: string,
  response: any
) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    const transports = (registrationInfo as any)?.transports ?? null;

    await db.insert(user_passkeys).values({
      user_id: userId,
      credential_id: Buffer.from(credentialID).toString("base64url"),
      public_key: Buffer.from(credentialPublicKey).toString("base64"),
      counter: counter ?? 0,
      transports: transports ? transports.join(",") : null,
    });
  }

  return verification;
}


export async function startAuth(email: string) {
  const [u] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!u) throw new Error("Utilisateur inconnu");
  const authenticators = await db
    .select()
    .from(user_passkeys)
    .where(eq(user_passkeys.user_id, u.id));
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: authenticators.map((a) => ({
      id: new Uint8Array(Buffer.from(a.credential_id, "base64url")),
      type: "public-key" as const,
    })) as any, // ✅ bypass typage
  });
  return { user: u, options };
}

export async function finishAuth(
  userId: number,
  expectedChallenge: string,
  response: any
) {
  const [auth] = await db
    .select()
    .from(user_passkeys)
    .where(eq(user_passkeys.user_id, userId))
    .limit(1);
  if (!auth) throw new Error("Aucun passkey");
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
  credentialID: new Uint8Array(Buffer.from(auth.credential_id, 'base64url')) as any, // ✅
  credentialPublicKey: new Uint8Array(Buffer.from(auth.public_key, 'base64')),
  counter: auth.counter,
  transports: auth.transports?.split(',') as any,
},

    requireUserVerification: false,
  });
  if (verification.verified) {
    await db
      .update(user_passkeys)
      .set({
        counter: verification.authenticationInfo.newCounter ?? auth.counter + 1,
      })
      .where(eq(user_passkeys.id, auth.id));
  }
  return verification;
}
