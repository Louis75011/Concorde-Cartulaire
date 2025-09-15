import { NextResponse } from 'next/server';

export async function POST() {
  const key = process.env.DOCUSEAL_API_KEY;
  if (!key) return new NextResponse('Missing DOCUSEAL_API_KEY', { status: 500 });
  return new NextResponse('DocuSeal clé présente');
}
