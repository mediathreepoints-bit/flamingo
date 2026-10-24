import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { apiPatch, apiDelete } from '@/lib/api';
import { repo, type Entity } from '@/lib/repo';

const ALLOWED: Entity[] = [
  'customers', 'vehicles', 'repairs', 'quotes', 'invoices',
  'payments', 'expenses', 'appointments', 'gallery', 'quoteRequests', 'messages',
  'promotions', 'services',
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { entity, id } = await params;
  if (!ALLOWED.includes(entity as Entity)) return NextResponse.json({ error: 'Entité inconnue' }, { status: 404 });
  try {
    const body = await req.json();
    const rec = await apiPatch(entity as Entity, id, body);
    if (!rec) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json({ ok: true, record: rec });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { entity, id } = await params;
  if (!ALLOWED.includes(entity as Entity)) return NextResponse.json({ error: 'Entité inconnue' }, { status: 404 });
  const ok = await apiDelete(entity as Entity, id);
  if (!ok) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { entity, id } = await params;
  if (!ALLOWED.includes(entity as Entity)) return NextResponse.json({ error: 'Entité inconnue' }, { status: 404 });
  const rec = await repo.get(entity as Entity, id);
  if (!rec) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({ record: rec });
}
