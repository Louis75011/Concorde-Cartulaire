const GC_BASE =
  process.env.GOCARDLESS_ENV === "live"
    ? "https://api.gocardless.com"
    : "https://api-sandbox.gocardless.com";

export async function gcFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = process.env.GOCARDLESS_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing GOCARDLESS_ACCESS_TOKEN in environment");
  }

  const res = await fetch(`${GC_BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "GoCardless-Version": "2015-07-06",
      "Content-Type": "application/json",
      "User-Agent": "Concorde-Cartulaire/1.0", // petit plus pour éviter certains blocs WAF
    },
    body: init?.body,
  });

  if (!res.ok) {
    const text = await res.text(); // souvent HTML quand bloqué par Cloudflare
    throw new Error(`GoCardless ${path} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
