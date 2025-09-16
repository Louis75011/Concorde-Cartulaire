const keyBytes = (process.env.TOTP_ENCRYPTION_KEY || "dev-dev-dev-dev-dev-32bytes!").slice(0, 32);

function getKey() {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(keyBytes), "AES-GCM", false, ["encrypt","decrypt"]);
}

export async function enc(plain: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));
  const out = new Uint8Array(iv.length + (ct as ArrayBuffer).byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(ct as ArrayBuffer), iv.length);
  return Buffer.from(out).toString("base64");
}

export async function dec(payloadB64: string) {
  const buf = Buffer.from(payloadB64, "base64");
  const iv = buf.subarray(0, 12);
  const data = buf.subarray(12);
  const key = await getKey();
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(pt);
}
