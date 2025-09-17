const GC_BASE =
  process.env.GOCARDLESS_ENV === "live"
    ? "https://api.gocardless.com"
    : "https://api-sandbox.gocardless.com";

function gcHeaders() {
  return {
    "Authorization": `Bearer ${process.env.GOCARDLESS_ACCESS_TOKEN}`,
    "GoCardless-Version": "2015-07-06",
    "Content-Type": "application/json",
  };
}

export async function gcFetch<T = any>(path: string, init?: RequestInit) {
  const res = await fetch(`${GC_BASE}${path}`, {
    ...init,
    headers: { ...gcHeaders(), ...(init?.headers || {}) }, // Important : pas d'auto body transform ici
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GoCardless ${path} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
