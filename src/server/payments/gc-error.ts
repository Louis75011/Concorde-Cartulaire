// src/server/payments/gc-error.ts
export function extractGcError(e: any) {
  const status = e?.response?.statusCode ?? e?.code;
  let body: any;
  const raw = e?.response?.body;

  if (typeof raw === "string") {
    try { body = JSON.parse(raw); } catch { body = raw; }
  } else {
    body = raw ?? e?.message;
  }

  return {
    status,
    errorType: e?.errorType,
    code: e?.code,
    documentationUrl: e?.documentationUrl,
    body,
  };
}
