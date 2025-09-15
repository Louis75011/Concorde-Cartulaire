const reg = new Map<string, string>();
const auth = new Map<string, string>();

export function setRegChallenge(email: string, c: string){ reg.set(email, c); }
export function getRegChallenge(email: string){ return reg.get(email) || ''; }
export function setAuthChallenge(email: string, c: string){ auth.set(email, c); }
export function getAuthChallenge(email: string){ return auth.get(email) || ''; }
