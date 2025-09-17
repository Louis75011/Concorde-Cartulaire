import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/server/db/client";
import { clients } from "@/server/db/schema";
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: any) {
  const id = Number(params.id);
  const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  if (!row) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: any) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await db.update(clients).set(body).where(eq(clients.id, id)).returning();
  return NextResponse.json(updated[0]);
}

export async function DELETE(req: NextRequest, { params }: any) {
  const id = Number(params.id);
  await db.delete(clients).where(eq(clients.id, id));
  return new NextResponse(null, { status: 204 });
}
