import { NextRequest, NextResponse } from "next/server";
import { gc } from "@/server/payments/gocardless-client";
import { db } from "@/server/db/client";
import { prelevements } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("payment_id");
  if (!id) return NextResponse.json({ ok:false, error:"missing payment_id" }, { status:400 });

  const p = await gc.payments.get(id);
  const statut =
    p.status === "confirmed" || p.status === "paid_out" ? "paid" :
    p.status === "failed" ? "failed" :
    p.status === "cancelled" ? "cancelled" : "submitted";

  await db.update(prelevements).set({ statut }).where(eq(prelevements.provider_event_id, id));
  return NextResponse.json({ ok:true, status: p.status });
}
