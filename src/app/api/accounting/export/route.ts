import { NextResponse } from 'next/server';
import { db } from '@/src/db/client';
import { factures, contrats, clients } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  // Very basic CSV for GnuCash: date, invoice_id, customer, amount_ttc, status
  // (In real usage, map to your Chart of Accounts and split VAT lines)
  const rows = await db.select().from(factures).limit(100);
  const lines = ['date;invoice_id;amount_ttc;status'];
  for (const r of rows) {
    const date = (r.date_emission as Date).toISOString().slice(0,10);
    lines.push([date, r.id, r.montant_ttc, r.statut_paiement].join(';'));
  }
  const csv = lines.join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="export-gnucash.csv"'
    }
  });
}
