#!/usr/bin/env node
/**
 * Export Hostinger — FLAMINGO AUTO KÉNITRA
 * Génère `flamingo-auto-hostinger.zip` : archive source prête à téléverser dans
 * hPanel → Sites web → Ajouter un site web → Application web Node.js (upload ZIP).
 * Hostinger installe les dépendances, build (standalone appliqué automatiquement)
 * et démarre le serveur. Voir HOSTINGER.md.
 *
 * Usage :  node scripts/export-hostinger.mjs [--skip-build]
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

// 1) Build de vérification (le ZIP contient les sources, Hostinger rebuilde)
if (!process.argv.includes('--skip-build')) {
  console.log('▸ Build Next.js (vérification)…');
  execSync('npm run build', { stdio: 'inherit' });
}

// 2) Staging des fichiers à exporter
const stage = path.join(root, 'dist-hostinger');
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

const includes = [
  'app', 'components', 'lib', 'public', 'data', 'supabase', 'scripts',
  'middleware.ts', 'next.config.mjs', 'next-env.d.ts',
  'package.json', 'package-lock.json', 'tsconfig.json',
  'tailwind.config.ts', 'postcss.config.mjs',
  '.env.example', 'ecosystem.config.cjs',
  'HOSTINGER.md', 'DEPLOYMENT.md', 'README.md',
];
for (const item of includes) {
  const src = path.join(root, item);
  if (!fs.existsSync(src)) {
    console.warn(`  (ignoré, absent : ${item})`);
    continue;
  }
  fs.cpSync(src, path.join(stage, item), {
    recursive: true,
    filter: (s) =>
      !s.includes(`${path.sep}node_modules${path.sep}`) &&
      !s.includes(`${path.sep}.git${path.sep}`) &&
      !s.endsWith('.DS_Store'),
  });
}

// 3) ZIP
const zip = path.join(root, 'flamingo-auto-hostinger.zip');
fs.rmSync(zip, { force: true });
execSync(`cd "${stage}" && zip -rq "${zip}" .`, { stdio: 'inherit' });
fs.rmSync(stage, { recursive: true, force: true });

const mb = (fs.statSync(zip).size / 1e6).toFixed(1);
console.log(`\n✔ Export prêt : flamingo-auto-hostinger.zip (${mb} Mo)`);
console.log('  hPanel → Sites web → Ajouter un site web → Application web Node.js → téléverser le ZIP.');
console.log('  Réglages : type "next", Node ≥ 20, install "npm ci", build "build", sortie ".next".');
console.log('  Variables : NEXT_PUBLIC_SITE_URL, ADMIN_SECRET, ADMIN_PASSWORD (+ Supabase optionnel).');
console.log('  Détails : HOSTINGER.md');
