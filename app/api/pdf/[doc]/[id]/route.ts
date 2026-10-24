import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { repo } from '@/lib/repo';
import { invoicePdf, quotePdf } from '@/lib/pdf';
import { DEFAULT_SETTINGS } from '@/lib/site';
import type { Customer, Invoice, Payment, Quote, Vehicle } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ doc: string; id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { doc, id } = await params;
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };

  if (doc === 'invoice') {
    const inv = await repo.get<Invoice>('invoices', id);
    if (!inv) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    const [client, vehicle, payments] = await Promise.all([
      inv.customerId ? repo.get<Customer>('customers', inv.customerId) : Promise.resolve(null),
      inv.vehicleId ? repo.get<Vehicle>('vehicles', inv.vehicleId) : Promise.resolve(null),
      repo.list<Payment>('payments'),
    ]);
    const buf = await invoicePdf(inv, s, { client, vehicle, payments: payments.filter((p) => p.invoiceId === inv.id) });
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${inv.ref}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  if (doc === 'quote') {
    const q = await repo.get<Quote>('quotes', id);
    if (!q) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });
    const [client, vehicle] = await Promise.all([
      q.customerId ? repo.get<Customer>('customers', q.customerId) : Promise.resolve(null),
      q.vehicleId ? repo.get<Vehicle>('vehicles', q.vehicleId) : Promise.resolve(null),
    ]);
    const buf = await quotePdf(q, s, { client, vehicle });
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${q.ref}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json({ error: 'Document inconnu' }, { status: 404 });
}
