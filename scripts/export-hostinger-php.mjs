#!/usr/bin/env node
/**
 * Export Hostinger PHP — FLAMINGO AUTO KÉNITRA
 * ============================================
 * Produit une archive prête à extraire dans public_html/flamingoauto :
 * site compilé HTML/CSS/JS (export statique Next, basePath /flamingoauto)
 * + backend PHP (auth sessions, CRUD admin, formulaires, uploads, PDF).
 * AUCUN Node.js requis en production. Les sources originales du dépôt ne
 * sont PAS modifiées : le build d'export est appliqué sur une copie temporaire.
 *
 * Usage :  node scripts/export-hostinger-php.mjs [--skip-build]
 * Sortie : sauvegarde/flamingo-auto-hostinger-php-AAAA-MM-JJ.zip (+ copie dans livraison/)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_PATH = process.env.PHP_BASE_PATH || '/flamingoauto';
const SITE_URL = process.env.PHP_SITE_URL || 'https://threepointsmedia.com/flamingoauto';
const stage = path.join(os.tmpdir(), 'flamingo-php-build');
const dist = path.join(root, 'dist-hostinger-php');

const EXCLUDE = new Set(['node_modules', '.git', '.next', 'sauvegarde', 'livraison', 'dist-hostinger', 'dist-hostinger-php', 'php-backend', '.arena', '.cache']);

function copyTree(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name) || e.name === 'tsconfig.tsbuildinfo' || e.name === 'netlify.toml') continue;
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyTree(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ——— 1) copie de travail ——— */
console.log('▸ Copie des sources vers', stage);
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
copyTree(root, stage);
fs.symlinkSync(path.join(root, 'node_modules'), path.join(stage, 'node_modules'), 'dir');

/* ——— 2) patchs d'export (uniquement dans la copie) ——— */
console.log('▸ Patchs export statique…');
fs.rmSync(path.join(stage, 'middleware.ts'), { force: true }); // non supporté en output:export
fs.rmSync(path.join(stage, 'app', 'api'), { recursive: true, force: true }); // remplacé par le backend PHP

function walk(dir, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn);
    else if (/\.(tsx?|jsx?|mjs)$/.test(e.name)) fn(p);
  }
}
walk(path.join(stage, 'app'), (p) => {
  const s = fs.readFileSync(p, 'utf8');
  const out = s.replace(/^export const dynamic = 'force-dynamic';\s*$/gm, '');
  if (out !== s) fs.writeFileSync(p, out);
});

fs.writeFileSync(path.join(stage, 'next.config.mjs'), `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '${BASE_PATH}',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: { optimizePackageImports: ['lucide-react', 'framer-motion'] },
};
export default nextConfig;
`);

// robots/sitemap : force-static requis par output:export
for (const f of ['app/robots.ts', 'app/sitemap.ts']) {
  const p2 = path.join(stage, f);
  const src = fs.readFileSync(p2, 'utf8');
  if (!src.includes('force-static')) fs.writeFileSync(p2, "export const dynamic = 'force-static';\n" + src);
}

// Détail réparation : le segment dynamique [id] est impossible en export statique.
// Remplacé par une page statique /admin/repairs/detail/ qui lit l'id dans l'URL
// (réécriture Apache dans root.htaccess) et charge la réparation via l'API PHP.
fs.rmSync(path.join(stage, 'app', '(panel)', 'admin', 'repairs', '[id]'), { recursive: true, force: true });
fs.mkdirSync(path.join(stage, 'app', '(panel)', 'admin', 'repairs', 'detail'), { recursive: true });
fs.writeFileSync(path.join(stage, 'app', '(panel)', 'admin', 'repairs', 'detail', 'page.tsx'), `'use client';

import { useEffect, useState } from 'react';
import { api } from '@/components/admin/client-api';
import RepairDetail from '@/components/admin/RepairDetail';
import type { Customer, Repair, Vehicle } from '@/lib/types';

export default function RepairDetailStaticPage() {
  const [data, setData] = useState<{ repair: Repair; customers: Customer[]; vehicles: Vehicle[] } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const m = window.location.pathname.match(/\\/admin\\/repairs\\/([A-Za-z0-9_-]+)\\/?$/);
    const q = new URLSearchParams(window.location.search).get('id');
    const id = q || (m ? m[1] : '');
    if (!id || id === 'detail') { setErr('Identifiant de réparation manquant'); return; }
    Promise.all([
      api<{ record: Repair }>('repairs', 'GET', id),
      api<{ rows: Customer[] }>('customers', 'GET'),
      api<{ rows: Vehicle[] }>('vehicles', 'GET'),
    ])
      .then(([r, c, v]) => setData({ repair: r.record, customers: c.rows || [], vehicles: v.rows || [] }))
      .catch((e: any) => setErr(e?.message || 'Réparation introuvable'));
  }, []);

  if (err) return <p className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">{err}</p>;
  if (!data) return <p className="py-16 text-center text-sm text-steel-500">Chargement de la réparation…</p>;
  return <RepairDetail repair={data.repair} customers={data.customers} vehicles={data.vehicles} />;
}
`);

// generateStaticParams obligatoire en output:export pour le segment [locale]
{
  const locLayout = path.join(stage, 'app', '(site)', '[locale]', 'layout.tsx');
  const src = fs.readFileSync(locLayout, 'utf8');
  if (!src.includes('generateStaticParams')) {
    fs.writeFileSync(locLayout, src + `
export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }, { locale: 'ar' }];
}
`);
  }
}

// Routes racine FR sans préfixe (en mode Node c'est le middleware qui réécrit
// / → /fr, /services → /fr/services, etc. — absent en export statique).
for (const route of ['', 'services', 'realisations', 'a-propos', 'devis', 'contact']) {
  const rel = route === '' ? './' : '../';
  const dir = route === '' ? path.join(stage, 'app') : path.join(stage, 'app', route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), `import type { Metadata } from 'next';
import LocaleLayout from '${rel}(site)/[locale]/layout';
import LocalePage, { generateMetadata as genLocaleMeta } from '${rel}(site)/[locale]${route ? '/' + route : ''}/page';

const frParams = { params: Promise.resolve({ locale: 'fr' }) };

export async function generateMetadata(): Promise<Metadata> {
  return genLocaleMeta(frParams);
}

export default function RootFrPage() {
  return (
    <LocaleLayout {...frParams}>
      <LocalePage {...frParams} />
    </LocaleLayout>
  );
}
`);
}

/* ——— 3) build statique ——— */
if (!process.argv.includes('--skip-build')) {
  console.log('▸ Build export statique (basePath ' + BASE_PATH + ')…');
  execSync('npm run build', {
    cwd: stage,
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_EXPORT_MODE: 'php',
      NEXT_PUBLIC_BASE_PATH: BASE_PATH,
      NEXT_PUBLIC_SITE_URL: SITE_URL,
    },
  });
}
const out = path.join(stage, 'out');
if (!fs.existsSync(out)) throw new Error('Build export introuvable : ' + out);

/* ——— 4) assemblage de l'archive ——— */
console.log('▸ Assemblage…');
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(out, dist, { recursive: true });

fs.cpSync(path.join(root, 'php-backend', 'api'), path.join(dist, 'api'), { recursive: true });
fs.copyFileSync(path.join(root, 'php-backend', 'root.htaccess'), path.join(dist, '.htaccess'));
fs.copyFileSync(path.join(root, 'php-backend', 'INSTALL-PHP.md'), path.join(dist, 'INSTALL-PHP.md'));

fs.mkdirSync(path.join(dist, 'data', 'sessions'), { recursive: true });
fs.copyFileSync(path.join(root, 'php-backend', 'data', '.htaccess'), path.join(dist, 'data', '.htaccess'));
fs.copyFileSync(path.join(root, 'php-backend', 'data', '.htaccess'), path.join(dist, 'data', 'sessions', '.htaccess'));
// db.json seed : données courantes si présentes, sinon le seed officiel
// (galerie réelle + promotion inactive) généré par le build dans le staging.
const dbSource = fs.existsSync(path.join(root, 'data', 'db.json'))
  ? path.join(root, 'data', 'db.json')
  : path.join(stage, 'data', 'db.json');
fs.copyFileSync(dbSource, path.join(dist, 'data', 'db.json'));

fs.mkdirSync(path.join(dist, 'uploads'), { recursive: true });
fs.copyFileSync(path.join(root, 'php-backend', 'uploads', '.htaccess'), path.join(dist, 'uploads', '.htaccess'));

// base_path du backend aligné sur le build
{
  const cfgFile = path.join(dist, 'api', 'config.php');
  const cfg = fs.readFileSync(cfgFile, 'utf8').replace(/'base_path' => '[^']*'/, `'base_path' => '${BASE_PATH}'`);
  fs.writeFileSync(cfgFile, cfg);
}

/* ——— 5) vérifications ——— */
const must = ['index.html', 'en/index.html', 'ar/index.html', 'admin/index.html', 'admin/login/index.html',
  'api/router.php', 'api/lib.php', 'api/config.php', 'api/pdf.php', 'api/vendor/fpdf.php',
  'data/db.json', 'data/.htaccess', '.htaccess', 'INSTALL-PHP.md', 'uploads/.htaccess', 'sitemap.xml'];
for (const m of must) {
  if (!fs.existsSync(path.join(dist, m))) throw new Error('Assemblage incomplet : ' + m);
}
const homeHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!homeHtml.includes(`${BASE_PATH}/_next/`)) throw new Error('basePath absent des assets HTML');
// aucun secret dans le JS public
execSync(`! grep -rlq 'flamingo2026' "${dist}/_next" 2>/dev/null`);
execSync(`! grep -rlq 'flamingo-auto-kenitra-v2-secret' "${dist}" 2>/dev/null`);
console.log('  ✓ structure, basePath et absence de secrets vérifiés');

/* ——— 6) ZIP + livraison ——— */
const date = new Date().toISOString().slice(0, 10);
const sauv = path.join(root, 'sauvegarde');
const livr = path.join(root, 'livraison');
fs.mkdirSync(sauv, { recursive: true });
fs.mkdirSync(livr, { recursive: true });
const zipName = `flamingo-auto-hostinger-php-${date}.zip`;
for (const dir of [sauv, livr]) {
  const zip = path.join(dir, zipName);
  fs.rmSync(zip, { force: true });
  execSync(`cd "${dist}" && zip -rq "${zip}" .`, { stdio: 'inherit' });
}
const mb = (fs.statSync(path.join(livr, zipName)).size / 1e6).toFixed(1);
console.log(`\n✔ Export PHP prêt : sauvegarde/${zipName} + livraison/${zipName} (${mb} Mo)`);
console.log('  Déploiement : extraire dans public_html/flamingoauto (voir INSTALL-PHP.md dans le ZIP).');
console.log('  ⚠ Changez admin_password_hash dans api/config.php avant la mise en ligne.');
