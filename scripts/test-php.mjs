#!/usr/bin/env node
/**
 * Test E2E du backend PHP (variante Hostinger) via PHP-WASM — aucun binaire PHP
 * requis sur la machine. Simule des requêtes HTTP complètes (méthode, URI,
 * corps JSON, cookies, fichiers téléversés) contre api/router.php, persiste
 * data/db.json, les sessions et les uploads entre requêtes, et vérifie :
 * auth, CRUD admin, règles métier (refs, historique, statuts de facture,
 * conversion devis→facture), formulaires publics, uploads, PDF, sécurité.
 *
 * Prérequis : npm i --no-save @php-wasm/node   (registre npm)
 * Usage     : node scripts/test-php.mjs [distDir]
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] || path.join(root, 'dist-hostinger-php'));
const STATE = '/tmp/php-test-state';
const BASE = '/flamingoauto';

// Le chargeur WASM résout son fichier relativement au cwd — se placer dans son dossier.
const ASYNCIFY = path.join(root, 'node_modules', '@php-wasm', 'node-8-3', 'asyncify');
process.chdir(ASYNCIFY);
const { loadNodeRuntime } = require(path.join(root, 'node_modules/@php-wasm/node'));
const { PHP } = require(path.join(root, 'node_modules/@php-wasm/universal'));
process.chdir(root);

/* ——— état persistant entre requêtes ——— */
fs.rmSync(STATE, { recursive: true, force: true });
fs.mkdirSync(path.join(STATE, 'sessions'), { recursive: true });
fs.mkdirSync(path.join(STATE, 'uploads'), { recursive: true });
fs.copyFileSync(path.join(DIST, 'data', 'db.json'), path.join(STATE, 'db.json'));

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
let pid = 100;
let pass = 0;
let fail = 0;

function check(label, cond, extra = '') {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label} ${extra}`); }
}

function walk(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}
const API_FILES = walk(path.join(DIST, 'api'));

async function request({ method = 'GET', uri, body = null, cookies = {}, files = [] }) {
  const php = new PHP(await loadNodeRuntime('8.3', { emscriptenOptions: { processId: pid++ } }));
  try {
    // arborescence applicative dans le FS du wasm
    for (const d of ['/app/api', '/app/api/vendor', '/app/data', '/app/data/sessions', '/app/uploads', '/tmpup']) {
      try { php.mkdirTree(d); } catch { /* existe déjà */ }
    }
    for (const rel of API_FILES) {
      if (rel.includes('/')) php.mkdirTree(`/app/api/${path.dirname(rel)}`);
      php.writeFile(`/app/api/${rel}`, fs.readFileSync(path.join(DIST, 'api', rel)));
    }
    php.writeFile('/app/data/db.json', fs.readFileSync(path.join(STATE, 'db.json')));
    php.writeFile('/app/data/.htaccess', 'Require all denied\n');
    for (const f of fs.readdirSync(path.join(STATE, 'sessions'))) {
      php.writeFile(`/app/data/sessions/${f}`, fs.readFileSync(path.join(STATE, 'sessions', f)));
    }
    php.writeFile('/app/uploads/.htaccess', 'Options -Indexes\n');

    // fichiers « téléversés »
    const filesSpec = files.map((f, i) => {
      php.writeFile(`/tmpup/${i}`, f.content);
      return { name: f.name, tmp_name: `/tmpup/${i}`, size: f.content.length, error: 0 };
    });

    const boot = `<?php
$GLOBALS['TEST_INPUT'] = base64_decode('${b64(body === null ? '' : (typeof body === 'string' ? body : JSON.stringify(body)))}');
$GLOBALS['TEST_FILES'] = json_decode(base64_decode('${b64(JSON.stringify({ photos: filesSpec }))}'), true) ?: [];
$GLOBALS['TEST_HEADERS'] = [];
$_SERVER['REQUEST_METHOD'] = base64_decode('${b64(method)}');
$_SERVER['REQUEST_URI'] = base64_decode('${b64(uri)}');
$_SERVER['HTTP_HOST'] = 'threepointsmedia.com';
$_SERVER['HTTPS'] = 'on';
$_COOKIE = json_decode(base64_decode('${b64(JSON.stringify(cookies))}'), true) ?: [];
register_shutdown_function(function () {
  echo "\\n@@STATUS@@" . (http_response_code() ?: 200);
  echo "\\n@@HEADERS@@" . json_encode($GLOBALS['TEST_HEADERS'] ?? []);
});
require '/app/api/router.php';
`;
    let res;
    try {
      res = await php.run({ code: boot });
    } catch (e) {
      // erreur fatale PHP : la réponse embarquée dans l'exception reste exploitable
      const rr = e?.response;
      const t = (rr?.text ?? String(e?.message ?? e)).slice(0, 600);
      return { status: rr?.httpStatusCode ?? 500, headers: [], body: `FATAL: ${t}`, json: null };
    }
    const stdout = res.text ?? '';
    const iStatus = stdout.indexOf('\n@@STATUS@@');
    const iHeaders = stdout.indexOf('\n@@HEADERS@@');
    const rawBody = iStatus >= 0 ? stdout.slice(0, iStatus) : stdout;
    const status = iStatus >= 0 ? parseInt(stdout.slice(iStatus + '\n@@STATUS@@'.length, iHeaders), 10) : 0;
    const headers = iHeaders >= 0 ? JSON.parse(stdout.slice(iHeaders + '\n@@HEADERS@@'.length)) : [];
    let json = null;
    try { json = JSON.parse(rawBody); } catch { /* binaire (PDF) ou vide */ }

    // persistance de l'état modifié
    try { php.writeFile && fs.writeFileSync(path.join(STATE, 'db.json'), Buffer.from(php.readFileAsBuffer('/app/data/db.json'))); } catch { /* inchangé */ }
    try {
      const wasmSess = php.listFiles('/app/data/sessions').filter((f) => f.endsWith('.json'));
      for (const f of wasmSess) fs.writeFileSync(path.join(STATE, 'sessions', f), Buffer.from(php.readFileAsBuffer(`/app/data/sessions/${f}`)));
      // miroir des suppressions (logout)
      for (const f of fs.readdirSync(path.join(STATE, 'sessions'))) {
        if (f.endsWith('.json') && !wasmSess.includes(f)) fs.rmSync(path.join(STATE, 'sessions', f));
      }
    } catch { /* aucune */ }
    try {
      for (const f of php.listFiles('/app/uploads')) {
        if (f !== '.htaccess') fs.writeFileSync(path.join(STATE, 'uploads', f), Buffer.from(php.readFileAsBuffer(`/app/uploads/${f}`)));
      }
    } catch { /* aucune */ }

    return { status, headers, body: rawBody, json };
  } finally {
    try { await php.exit?.(); } catch { /* déjà terminé */ }
    try { php.destroy?.(); } catch { /* noop */ }
  }
}

function cookieFrom(res, name = 'fk_php_session') {
  const h = res.headers.find((x) => x.startsWith(`Set-Cookie: ${name}=`));
  return h ? h.slice(`Set-Cookie: ${name}=`.length).split(';')[0] : null;
}

/* ————————————————— scénarios ————————————————— */
const dbgOf = (r) => String(r.status)+' '+String(r.body).slice(0,220)+' hdr='+JSON.stringify(r.headers).slice(0,160);

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9]);

console.log('— Sécurité : accès non authentifié —');
let r = await request({ uri: `${BASE}/api/auth/me` });
check('GET /api/auth/me sans cookie → 401', r.status === 401);
r = await request({ uri: `${BASE}/api/admin/quotes` });
check('GET /api/admin/quotes sans cookie → 401', r.status === 401 && r.json?.error === 'Non autorisé');

console.log('— Auth —');
r = await request({ method: 'POST', uri: `${BASE}/api/auth/login`, body: { identifier: 'admin', password: 'mauvais' } });
check('login mauvais mot de passe → 401', r.status === 401);
r = await request({ method: 'POST', uri: `${BASE}/api/auth/login`, body: { identifier: 'admin', password: 'flamingo2026' } });
const sid = cookieFrom(r);
check('login valide → 200 {ok:true}', r.status === 200 && r.json?.ok === true, dbgOf(r));
check('cookie de session émis (HttpOnly/Lax)', Boolean(sid && /^[a-f0-9]{64}$/.test(sid)) && r.headers.some((h) => h.startsWith('Set-Cookie:') && h.includes('HttpOnly') && h.includes('SameSite=Lax') && h.includes('Secure')));
const C = { fk_php_session: sid };
r = await request({ uri: `${BASE}/api/auth/me`, cookies: C });
check('GET /me avec cookie → {user:"admin"}', r.status === 200 && r.json?.user === 'admin');

console.log('— CRUD admin + règles métier —');
r = await request({ uri: `${BASE}/api/admin/quotes`, cookies: C });
check('GET quotes → {rows:[]}', r.status === 200 && Array.isArray(r.json?.rows) && r.json.rows.length === 0);
r = await request({ method: 'POST', uri: `${BASE}/api/admin/customers`, cookies: C, body: { nom: 'Client Test', telephone: '0661000111', ville: 'Kénitra' } });
const custId = r.json?.record?.id;
check('POST customers → record id cu_*', r.status === 200 && String(custId || '').startsWith('cu_'));
r = await request({ method: 'POST', uri: `${BASE}/api/admin/vehicles`, cookies: C, body: { marque: 'Peugeot', modele: '208', immatriculation: '12345-A-1', customerId: custId } });
const vehId = r.json?.record?.id;
check('POST vehicles → record id ve_*', r.status === 200 && String(vehId || '').startsWith('ve_'));
r = await request({ method: 'POST', uri: `${BASE}/api/admin/repairs`, cookies: C, body: { customerId: custId, vehicleId: vehId, description: 'Aile avant à redresser' } });
const repId = r.json?.record?.id;
const year = new Date().getFullYear();
check(`POST repairs → ref REP-${year}-0001 + défauts + historique`, r.status === 200 && r.json?.record?.ref === `REP-${year}-0001` && r.json?.record?.status === 'diagnostic' && r.json?.record?.priority === 'normale' && r.json?.record?.history?.length === 1);
r = await request({ method: 'PATCH', uri: `${BASE}/api/admin/repairs/${repId}`, cookies: C, body: { status: 'en_cours' } });
check('PATCH repairs statut → historique 2 entrées', r.status === 200 && r.json?.record?.history?.length === 2 && r.json?.record?.history?.[1]?.status === 'en_cours');
r = await request({ method: 'POST', uri: `${BASE}/api/admin/quotes`, cookies: C, body: { customerId: custId, vehicleId: vehId, items: [{ label: 'Peinture capot', qty: 2, unit: 'forfait', price: 500 }], discount: 100, tva: 20 } });
const quoteId = r.json?.record?.id;
check(`POST quotes → ref DV-${year}-0001, tva 20`, r.status === 200 && r.json?.record?.ref === `DV-${year}-0001` && r.json?.record?.status === 'brouillon');

console.log('— PDF —');
r = await request({ uri: `${BASE}/api/pdf/quote/${quoteId}`, cookies: C });
check('GET pdf/quote → 200 application/pdf %PDF', r.status === 200 && r.headers.some((h) => h === 'Content-Type: application/pdf') && r.body.startsWith('%PDF'), dbgOf(r));
r = await request({ uri: `${BASE}/api/pdf/quote/inconnu`, cookies: C });
check('GET pdf/quote inconnu → 404', r.status === 404 && r.json?.error === 'Devis introuvable');

console.log('— Conversion devis → facture + paiements —');
r = await request({ method: 'POST', uri: `${BASE}/api/admin/convert-quote`, cookies: C, body: { quoteId } });
const invId = r.json?.invoice?.id;
check(`POST convert-quote → facture FA-${year}-0001`, r.status === 200 && r.json?.invoice?.ref === `FA-${year}-0001` && r.json?.invoice?.notes === `Issue du devis DV-${year}-0001`);
r = await request({ uri: `${BASE}/api/admin/quotes/${quoteId}`, cookies: C });
check('devis converti → statut "facture"', r.json?.record?.status === 'facture');
r = await request({ method: 'POST', uri: `${BASE}/api/admin/payments`, cookies: C, body: { invoiceId: invId, amount: 1080, method: 'especes' } });
const payId = r.json?.record?.id;
check('POST payments (TTC 1080 = (1000-100)*1.2)', r.status === 200 && String(payId || '').startsWith('pa_'));
r = await request({ uri: `${BASE}/api/admin/invoices`, cookies: C });
check('facture entièrement réglée → statut "payee"', r.json?.rows?.[0]?.status === 'payee');
r = await request({ method: 'DELETE', uri: `${BASE}/api/admin/payments/${payId}`, cookies: C });
check('DELETE payment → 200', r.status === 200 && r.json?.ok === true);
r = await request({ uri: `${BASE}/api/admin/invoices`, cookies: C });
check('après suppression paiement → statut "emise"', r.json?.rows?.[0]?.status === 'emise');
r = await request({ uri: `${BASE}/api/pdf/invoice/${invId}`, cookies: C });
check('GET pdf/invoice → %PDF', r.status === 200 && r.body.startsWith('%PDF'), dbgOf(r));

console.log('— Dépenses + réglages —');
r = await request({ method: 'POST', uri: `${BASE}/api/admin/expenses`, cookies: C, body: { category: 'pieces', label: 'Achat pièce test', amount: '75.5', method: 'especes' } });
check('POST expenses → amount numérique 75.5', r.status === 200 && r.json?.record?.amount === 75.5);
r = await request({ uri: `${BASE}/api/admin/settings`, cookies: C });
check('GET settings → valeurs officielles', r.status === 200 && r.json?.settings?.phone === '0661 50 86 74' && r.json?.settings?.brand === 'FLAMINGO AUTO');
r = await request({ method: 'PATCH', uri: `${BASE}/api/admin/settings`, cookies: C, body: { phone: '0661 99 99 99' } });
check('PATCH settings → ok', r.status === 200 && r.json?.ok === true);
r = await request({ uri: `${BASE}/api/admin/settings`, cookies: C });
check('settings modifié + fusion défauts', r.json?.settings?.phone === '0661 99 99 99' && r.json?.settings?.brand === 'FLAMINGO AUTO');

console.log('— Données publiques du site —');
r = await request({ uri: `${BASE}/api/public/site-data` });
check('GET public/site-data SANS auth → galerie 3 + promo inactive null', r.status === 200 && r.json?.gallery?.length === 3 && r.json?.promotion === null && Array.isArray(r.json?.services));

console.log('— Formulaires publics —');
r = await request({ method: 'POST', uri: `${BASE}/api/quote`, body: { name: 'Ahmed Benali', phone: '06 61 50 86 74', brand: 'Renault', model: 'Clio', year: '2019', repairType: 'polissage', message: 'Rayures sur le capot, merci.', photos: [] } });
check('POST quote public → ok + id qr_*', r.status === 200 && r.json?.ok === true && String(r.json?.id || '').startsWith('qr_'), dbgOf(r));
r = await request({ uri: `${BASE}/api/admin/quoteRequests`, cookies: C });
check('demande visible dans l’admin (statut nouveau, tél normalisé)', r.json?.rows?.length === 1 && r.json.rows[0].status === 'nouveau' && r.json.rows[0].phone === '0661508674');
r = await request({ method: 'POST', uri: `${BASE}/api/quote`, body: { name: 'A', phone: '123' } });
check('POST quote invalide → 400 « Veuillez indiquer votre nom »', r.status === 400 && r.json?.error === 'Veuillez indiquer votre nom');
r = await request({ method: 'POST', uri: `${BASE}/api/contact`, body: { name: 'Sara Alaoui', email: 'sara@example.ma', message: 'Bonjour, je souhaite un rendez-vous pour un polissage complet.' } });
check('POST contact → ok', r.status === 200 && r.json?.ok === true, dbgOf(r));
r = await request({ method: 'POST', uri: `${BASE}/api/contact`, body: { name: 'Sara Alaoui', message: 'court' } });
check('POST contact message court → 400', r.status === 400 && r.json?.error === 'Message trop court', dbgOf(r));

console.log('— Uploads —');
r = await request({ method: 'POST', uri: `${BASE}/api/upload`, files: [{ name: 'degat.jpg', content: JPEG }] });
const upPath = r.json?.paths?.[0];
check('POST upload JPEG valide → /uploads/*.jpg + fichier écrit', r.status === 200 && /^\/uploads\/\d+-[a-f0-9]{6}\.jpg$/.test(String(upPath)) && fs.existsSync(path.join(STATE, 'uploads', path.basename(String(upPath)))), dbgOf(r));
r = await request({ method: 'POST', uri: `${BASE}/api/upload`, files: [{ name: 'script.php.jpg', content: Buffer.from('<?php echo "hack"; ?>', 'utf8') }] });
check('POST upload non-image (PHP déguisé) → 400', r.status === 400 && r.json?.error === 'Chaque photo doit être une image de moins de 10 Mo');
r = await request({ method: 'POST', uri: `${BASE}/api/upload` });
check('POST upload sans fichier → 400', r.status === 400 && r.json?.error === 'Aucun fichier reçu');

console.log('— Erreurs + déconnexion —');
r = await request({ uri: `${BASE}/api/admin/inconnu`, cookies: C });
check('GET entité inconnue → 404 « Entité inconnue »', r.status === 404 && r.json?.error === 'Entité inconnue');
r = await request({ method: 'DELETE', uri: `${BASE}/api/admin/customers/inexistant`, cookies: C });
check('DELETE inexistant → 404 « Introuvable »', r.status === 404 && r.json?.error === 'Introuvable');
r = await request({ method: 'POST', uri: `${BASE}/api/auth/logout`, cookies: C });
check('POST logout → ok', r.status === 200 && r.json?.ok === true);
r = await request({ uri: `${BASE}/api/auth/me`, cookies: C });
check('session détruite → /me 401', r.status === 401);

console.log(`\n${fail === 0 ? '✔' : '✘'} Résultat : ${pass} réussis, ${fail} échoués`);
process.exit(fail === 0 ? 0 : 1);
