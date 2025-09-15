import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const key = process.env.DOCUSEAL_API_KEY;
  if (!key) return new NextResponse('Missing DOCUSEAL_API_KEY', { status: 500 });
  const body = await req.json();

  const r = await fetch('https://api.docuseal.com/submissions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: body.template_id,
      submitters: [{ email: body.email, name: body.name }],
      title: body.title
    })
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
