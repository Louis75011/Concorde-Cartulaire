// src/server/payments/gc-http.ts
// Client HTTP minimal fiable pour GoCardless (sandbox/live)
const BASE =
  process.env.GOCARDLESS_ENV === "live"
    ? "https://api.gocardless.com"
    : "https://api-sandbox.gocardless.com";

const TOKEN = (process.env.GOCARDLESS_ACCESS_TOKEN || "").trim();
if (!TOKEN) throw new Error("Missing GOCARDLESS_ACCESS_TOKEN");

export async function gcFetch<T = any>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${TOKEN}`,
    "GoCardless-Version": "2015-07-06",
    Accept: "application/json",
    "User-Agent": "ConcordeCartulaire/0.1 (localdev)",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
    ...(init.headers as any),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // renvoie l’erreur “lisible” pour debug
    throw Object.assign(new Error("GC API error"), { status: res.status, body: json });
  }
  return json as T;
}
