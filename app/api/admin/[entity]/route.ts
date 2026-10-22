import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { apiCreate } from '@/lib/api';
import { repo, type Entity } from '@/lib/repo';

const ALLOWED: Entity[] = [
  'customers', 'vehicles', 'repairs', 'quotes', 'invoices',
  'payments', 'appointments', 'gallery', 'quoteRequests', 'messages',
  'promotions', 'services',
];

export async function GET(req: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { entity } = await params;
  if (!ALLOWED.includes(entity as Entity)) return NextResponse.json({ error: 'Entité inconnue' }, { status: 404 });
  const rows = await repo.list(entity as Entity);
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { entity } = await params;
  if (!ALLOWED.includes(entity as Entity)) return NextResponse.json({ error: 'Entité inconnue' }, { status: 404 });
  try {
    const body = await req.json();
    const rec = await apiCreate(entity as Entity, body);
    return NextResponse.json({ ok: true, record: rec });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 });
  }
}
