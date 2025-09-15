import { NextRequest, NextResponse } from 'next/server';

const GC_URL = (process.env.GOCARDLESS_ENV === 'live')
  ? 'https://api.gocardless.com'
  : 'https://api-sandbox.gocardless.com';

export async function POST(req: NextRequest) {
  const token = process.env.GOCARDLESS_ACCESS_TOKEN;
  if (!token) return new NextResponse('Missing GOCARDLESS_ACCESS_TOKEN', { status: 500 });
  const body = await req.json();

  // Minimal example: create customer + mandate using test details (sandbox).
  // In production you must collect IBAN per RGPD and send via API directly or redirect flows.
  const headers = {
    'Authorization': `Bearer ${token}`,
    'GoCardless-Version': '2015-07-06',
    'Content-Type': 'application/json',
  };

  // 1) Create customer
  const customerRes = await fetch(`${GC_URL}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ customers: { given_name: body.given_name, family_name: body.family_name, email: body.email, address_line1: 'Test', city: 'Paris', postal_code: '75001', country_code: 'FR' } })
  });
  const customerJson = await customerRes.json();
  if (!customerRes.ok) return NextResponse.json(customerJson, { status: customerRes.status });
  const customerId = customerJson.customers.id;

  // 2) Create mandate with test bank details
  const mandateRes = await fetch(`${GC_URL}/mandates`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ mandates: { scheme: 'sepa_core', links: { customer_bank_account: null, customer: customerId } } })
  });
  const mandateJson = await mandateRes.json();
  return NextResponse.json({ customer: customerJson, mandate: mandateJson });
}
