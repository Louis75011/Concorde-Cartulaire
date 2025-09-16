// src/app/(auth)/me/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, uid: s.uid });
}

// import { NextResponse } from "next/server";
// import { getSession } from "@/server/auth/session";

// export async function GET() {
//   const s = await getSession();
//   if (!s) return NextResponse.json({ authenticated: false }, { status: 401 });
//   return NextResponse.json({ authenticated: true, uid: s.uid });
// }
