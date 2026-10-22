import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/repo';
import { uid } from '@/lib/format';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').replace(/[^\d+]/g, '');
    if (name.length < 2) return NextResponse.json({ error: 'Veuillez indiquer votre nom' }, { status: 400 });
    if (phone.length < 9) return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 });

    const rec = {
      id: uid('qr'),
      name,
      phone,
      brand: String(body.brand || '').trim(),
      model: String(body.model || '').trim(),
      year: String(body.year || '').trim(),
      repairType: String(body.repairType || '').trim(),
      message: String(body.message || '').trim().slice(0, 2000),
      photos: Array.isArray(body.photos) ? body.photos.slice(0, 6).map(String) : [],
      createdAt: new Date().toISOString(),
      status: 'nouveau' as const,
    };
    await repo.create('quoteRequests', rec);
    return NextResponse.json({ ok: true, id: rec.id });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
