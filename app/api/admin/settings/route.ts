import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS } from '@/lib/site';

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...(await repo.settings()) } });
}

export async function PATCH(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    const body = await req.json();
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(body || {})) {
      if (typeof v === 'string') patch[k] = v.trim();
    }
    await repo.saveSettings(patch);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
}
