import { NextResponse } from 'next/server';

export async function POST() {
  const token = process.env.GOCARDLESS_ACCESS_TOKEN;
  if (!token) return new NextResponse('Missing GOCARDLESS_ACCESS_TOKEN', { status: 500 });
  // simple check: just acknowledge present
  return new NextResponse('GoCardless token présent (sandbox)');
}
