import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { appRoot, isStandaloneCwd } from '@/lib/paths';

// Endpoint PUBLIC : le formulaire de devis du site (photos des dégâts) et les
// gestionnaires admin l'utilisent. Validations strictes : images uniquement,
// 10 Mo max par fichier, 6 fichiers max, noms aléatoires non devinables.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const files = form.getAll('photos').filter((f): f is File => f instanceof File);
    if (!files.length) return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    if (files.length > 6) return NextResponse.json({ error: 'Maximum 6 photos' }, { status: 400 });

    const dir = path.join(appRoot(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    // en mode standalone, le serveur sert public/ depuis son propre cwd :
    // on copie aussi le fichier là pour qu'il soit visible immédiatement.
    const mirror = isStandaloneCwd() ? path.join(process.cwd(), 'public', 'uploads') : null;
    if (mirror) await mkdir(mirror, { recursive: true });

    const saved: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Chaque photo doit être une image de moins de 10 Mo' }, { status: 400 });
      }
      const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'jpg';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, name), buf);
      if (mirror) await copyFile(path.join(dir, name), path.join(mirror, name)).catch(() => {});
      saved.push(`/uploads/${name}`);
    }
    return NextResponse.json({ paths: saved });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
