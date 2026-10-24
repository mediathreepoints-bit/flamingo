import fs from 'node:fs';
import path from 'node:path';

let cached: string | null = null;

/** Racine du projet — fiable aussi en mode « standalone » (Hostinger, VPS…),
 *  où le serveur Next fait process.chdir('.next/standalone').
 *  Remonte jusqu'au dossier contenant data/ (ou app/ + package.json).
 *  Forçable via la variable d'environnement APP_ROOT. */
export function appRoot(): string {
  if (cached) return cached;
  const env = process.env.APP_ROOT;
  if (env) {
    cached = path.resolve(env);
    return cached;
  }
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (
      fs.existsSync(path.join(dir, 'data')) ||
      (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'app')))
    ) break;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  cached = dir;
  return cached;
}

/** Vrai quand le serveur tourne depuis .next/standalone (cwd ≠ racine). */
export function isStandaloneCwd(): boolean {
  return path.resolve(process.cwd()) !== appRoot();
}
