import { NextRequest, NextResponse } from "next/server";
import { ilike, asc, desc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { clients } from "@/server/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/clients
 * ?q=filtre&order=id.desc
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const order = searchParams.get("order") || "id.desc";

  const [_, dir] = order.split(".");
  const where = q ? ilike(clients.nom, `%${q}%`) : undefined;

  const rows = await db
    .select()
    .from(clients)
    .where(where as any)
    .orderBy(dir === "desc" ? desc(clients.id) : asc(clients.id))
    .limit(200);

  return NextResponse.json(rows);
}

/**
 * POST /api/clients
 * body: { nom, email, tel?, entreprise?, secteur? }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const inserted = await db
    .insert(clients)
    .values({
      nom: body.nom,
      email: body.email,
      tel: body.tel,
      entreprise: body.entreprise,
      secteur: body.secteur,
    })
    .returning();

  return NextResponse.json(inserted[0], { status: 201 });
}
