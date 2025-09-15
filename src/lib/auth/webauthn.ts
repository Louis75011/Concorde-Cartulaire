import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

export const rpID = process.env.WEBAUTHN_RP_ID!;
export const rpName = process.env.WEBAUTHN_RP_NAME!;
export const origin = process.env.WEBAUTHN_ORIGIN!;

export function regOptions(userId: string, username: string) {
  return generateRegistrationOptions({
    rpID,
    rpName,
    userID: new TextEncoder().encode(userId), // ✅ convertit string → Uint8Array
    userName: username, // ✅ reste string
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });
}

export function authOptions() {
  return generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
  });
}

export async function verifyRegResponse(response: any, expectedChallenge: string) {
  return verifyRegistrationResponse({
    response,
    expectedChallenge,     // ✅ string
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });
}

export async function verifyAuthResponse(
  response: any,
  expectedChallenge: string,
  credentialPublicKey: string,
  counter: number
) {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,     // ✅ string
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      // @ts-expect-error
      credentialID: new Uint8Array(Buffer.from(response.rawId, 'base64url')),   // ✅ Uint8Array
      credentialPublicKey: new Uint8Array(Buffer.from(credentialPublicKey, 'base64')), // ✅ Uint8Array
      counter,
    },
    requireUserVerification: false,
  });
}
