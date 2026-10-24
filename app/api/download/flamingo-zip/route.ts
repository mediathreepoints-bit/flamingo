import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { appRoot } from '@/lib/paths';

export const dynamic = 'force-dynamic';

/** Sert la dernière archive d'export présente dans sauvegarde/.
 *  ?v=php  → flamingo-auto-hostinger-php-AAAA-MM-JJ.zip (variante hébergement PHP)
 *  sinon   → flamingo-auto-hostinger-AAAA-MM-JJ.zip (déploiement Node/standalone)
 *  Les archives ne contiennent aucun secret. */
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('v') || 'node';
  const re = v === 'php'
    ? /^flamingo-auto-hostinger-php-\d{4}-\d{2}-\d{2}\.zip$/
    : /^flamingo-auto-hostinger-\d{4}-\d{2}-\d{2}\.zip$/;
  const dir = path.join(appRoot(), 'sauvegarde');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => re.test(f)) : [];
  if (!files.length) {
    return NextResponse.json(
      { error: 'Archive introuvable — régénérez avec : node scripts/export-hostinger.mjs (ou export-hostinger-php.mjs)' },
      { status: 404 },
    );
  }
  files.sort((a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs);
  const name = files[0];
  const buf = fs.readFileSync(path.join(dir, name));
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Content-Length': String(buf.byteLength),
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
