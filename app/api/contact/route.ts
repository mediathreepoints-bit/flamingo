import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/repo';
import { uid } from '@/lib/format';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const message = String(body.message || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').replace(/[^\d+]/g, '');
    if (name.length < 2) return NextResponse.json({ error: 'Veuillez indiquer votre nom' }, { status: 400 });
    if (message.length < 10) return NextResponse.json({ error: 'Message trop court' }, { status: 400 });
    if (!email && !phone) return NextResponse.json({ error: 'Indiquez un email ou un téléphone' }, { status: 400 });

    await repo.create('messages', {
      id: uid('ms'),
      name,
      email,
      phone,
      message: message.slice(0, 4000),
      createdAt: new Date().toISOString(),
      status: 'nouveau',
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
