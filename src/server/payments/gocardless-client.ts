// src/server/payments/gocardless-client.ts
// La lib est CommonJS → require
// (évite tout code exécutable au top-level)
const gocardless = require("gocardless-nodejs");

let _gc: any | null = null;

export function getGC() {
  if (_gc) return _gc;

  const raw = process.env.GOCARDLESS_ACCESS_TOKEN;
  const env = process.env.GOCARDLESS_ENV === "live" ? "live" : "sandbox";

  if (!raw) {
    // NE PAS throw au build : laissez l’API route gérer l’erreur
    throw new Error("GOCARDLESS_ACCESS_TOKEN manquant (runtime)");
  }

  const token = raw.trim();
  _gc = gocardless(token, { environment: env });
  return _gc;
}

// // src/server/payments/gocardless-client.ts
// // Utiliser require car la lib est CommonJS
// const gocardless = require("gocardless-nodejs");

// const raw = process.env.GOCARDLESS_ACCESS_TOKEN;
// if (!raw) {
//   throw new Error("Missing GOCARDLESS_ACCESS_TOKEN");
// }

// // ⚠️ supprime espaces ou \r\n accidentels
// const token = raw.trim();
// const env = process.env.GOCARDLESS_ENV === "live" ? "live" : "sandbox";

// export const gc = gocardless(token, {
//   environment: env,
//   version: "2015-07-06",
// });
// console.log("[GC] env =", env, "tokenPrefix =", token.slice(0, 10), "len =", token.length);
