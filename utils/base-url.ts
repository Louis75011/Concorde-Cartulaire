// // utils/base-url.ts
// import { headers } from "next/headers";

// export function getBaseUrlFromRequest() {
//   const h = headers();
//   const proto = h.get("x-forwarded-proto") || "http";
//   const host = h.get("host") || "localhost:3000";
//   return `${proto}://${host}`;
// }
