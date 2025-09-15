let lastChallenge = '';

export function setChallenge(challenge: string) {
  lastChallenge = challenge;
}

export function getChallenge() {
  return lastChallenge;
}
