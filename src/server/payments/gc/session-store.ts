// src/server/payments/gc/session-store.ts
const mem = new Map<string, string>(); // key = invoice_id, value = session_token
export const GcSessionStore = {
  put(invoiceId: string, token: string) { mem.set(invoiceId, token); },
  get(invoiceId: string) { return mem.get(invoiceId); },
  del(invoiceId: string) { mem.delete(invoiceId); },
};
