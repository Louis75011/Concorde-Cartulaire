import { NextResponse } from "next/server";
import { getGC } from "@/server/payments/gocardless-client";

export const runtime = "nodejs"; // pas "edge"
export const dynamic = "force-dynamic"; // jamais pré-rendu
// export const revalidate = 0;           // optionnel, pour forcer no-cache

export async function GET() {
  try {
    const gc = getGC(); // init au runtime uniquement
    // ping léger : liste 1 resource
    await gc.customers.list({ limit: 1 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { gc } from "@/server/payments/gocardless-client";
// import { db } from "@/server/db/client";
// import { prelevements } from "@/server/db/schema";
// import { eq } from "drizzle-orm";

// export const runtime = "nodejs";

// export async function GET(req: NextRequest) {
//   const id = req.nextUrl.searchParams.get("payment_id");
//   if (!id) return NextResponse.json({ ok:false, error:"missing payment_id" }, { status:400 });

//   const p = await gc.payments.get(id);
//   const statut =
//     p.status === "confirmed" || p.status === "paid_out" ? "paid" :
//     p.status === "failed" ? "failed" :
//     p.status === "cancelled" ? "cancelled" : "submitted";

//   await db.update(prelevements).set({ statut }).where(eq(prelevements.provider_event_id, id));
//   return NextResponse.json({ ok:true, status: p.status });
// }
