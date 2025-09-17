import { NextResponse } from "next/server";
import { gcFetch } from "@/server/payments/gc-http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const r = await gcFetch<{ customers: any[]; meta: any }>(
      "/customers?limit=1",
      { method: "GET" }
    );
    return NextResponse.json({
      ok: true,
      env: process.env.GOCARDLESS_ENV,
      customersCount: r.customers?.length ?? 0,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, status: e?.status, body: e?.body },
      { status: 500 }
    );
  }
}
