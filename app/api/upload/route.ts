import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll('photos').filter((f): f is File => f instanceof File);
    if (!files.length) return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    if (files.length > 6) return NextResponse.json({ error: 'Maximum 6 photos' }, { status: 400 });

    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });

    const saved: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Chaque photo doit être une image de moins de 10 Mo' }, { status: 400 });
      }
      const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'jpg';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
      saved.push(`/uploads/${name}`);
    }
    return NextResponse.json({ paths: saved });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
