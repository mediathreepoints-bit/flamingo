import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { convertQuote } from '@/lib/api';

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    const { quoteId } = await req.json();
    const invoice = await convertQuote(String(quoteId || ''));
    if (!invoice) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });
    return NextResponse.json({ ok: true, invoice });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 });
  }
}
