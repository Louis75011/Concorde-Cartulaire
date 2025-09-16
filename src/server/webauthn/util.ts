export function b64urlToUint8Array(b64url: string): Uint8Array {
  // atob/Buffer gèrent base64, on adapte le base64url
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const base64 = (b64url.replace(/-/g, "+").replace(/_/g, "/")) + pad;
  const bin = Buffer.from(base64, "base64");
  return new Uint8Array(bin);
}

export function uint8ToBuffer(u8: Uint8Array): Buffer {
  return Buffer.from(u8);
}
