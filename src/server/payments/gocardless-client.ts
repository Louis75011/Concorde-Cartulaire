// src/server/payments/gocardless-client.ts
// Utiliser require car la lib est CommonJS
const gocardless = require("gocardless-nodejs");

const raw = process.env.GOCARDLESS_ACCESS_TOKEN;
if (!raw) {
  throw new Error("Missing GOCARDLESS_ACCESS_TOKEN");
}

// ⚠️ supprime espaces ou \r\n accidentels
const token = raw.trim();
const env = process.env.GOCARDLESS_ENV === "live" ? "live" : "sandbox";

export const gc = gocardless(token, {
  environment: env,
  version: "2015-07-06",
});
console.log("[GC] env =", env, "tokenPrefix =", token.slice(0, 10), "len =", token.length);
