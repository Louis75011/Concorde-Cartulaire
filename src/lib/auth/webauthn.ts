import type { GenerateRegistrationOptionsOpts, VerifyRegistrationResponseOpts, GenerateAuthenticationOptionsOpts, VerifyAuthenticationResponseOpts } from '@simplewebauthn/server';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

export const rpID = process.env.WEBAUTHN_RP_ID!;
export const rpName = process.env.WEBAUTHN_RP_NAME!;
export const origin = process.env.WEBAUTHN_ORIGIN!;

export function regOptions(userId: string, username: string) {
  return generateRegistrationOptions({
    rpID, rpName,
    userID: userId,
    userName: username,
    attestationType: 'none',
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
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
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });
}

export async function verifyAuthResponse(response: any, expectedChallenge: string, credentialPublicKey: string, counter: number) {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: Buffer.from(response.rawId, 'base64url'),
      credentialPublicKey: Buffer.from(credentialPublicKey, 'base64'),
      counter,
    },
    requireUserVerification: false,
  });
}
