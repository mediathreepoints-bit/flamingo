#!/usr/bin/env node
/**
 * Serveur d'aperçu de la variante Hostinger PHP — dashboard pleinement fonctionnel.
 *
 * Sert le dist statique (dist-hostinger-php) sous le basePath /flamingoauto ET
 * exécute réellement l'API PHP (api/router.php) via PHP-WASM : auth par cookie
 * de session, CRUD admin, formulaires publics, uploads, PDF… comme sur Hostinger.
 *
 * L'état (data/db.json, data/sessions/, uploads/) est persisté sur le disque
 * dans le dist après chaque requête d'écriture.
 *
 * Prérequis : npm i --no-save @php-wasm/node @php-wasm/universal @php-wasm/node-8-3
 * Usage     : node scripts/preview-php-server.mjs [distDir] [port]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] || path.join(root, 'dist-hostinger-php'));
const PORT = Number(process.argv[3] || 8080);
const BASE = '/flamingoauto';

if (!fs.existsSync(path.join(DIST, 'api', 'router.php'))) {
  console.error(`✗ dist introuvable ou incomplet : ${DIST}\n  Générez-le d'abord : node scripts/export-hostinger-php.mjs`);
  process.exit(1);
}

/* ——— chargement du runtime PHP-WASM (le loader résout le .wasm via cwd) ——— */
const ASYNCIFY = path.join(root, 'node_modules', '@php-wasm', 'node-8-3', 'asyncify');
process.chdir(ASYNCIFY);
const { loadNodeRuntime } = require(path.join(root, 'node_modules/@php-wasm/node'));
const { PHP } = require(path.join(root, 'node_modules/@php-wasm/universal'));
process.chdir(root);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.pdf': 'application/pdf',
  '.map': 'application/json',
};

const b64 = (v) => Buffer.from(v).toString('base64');

function walk(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}

/* ——— instance PHP unique + file d'attente série ——— */
let php = null;
let queue = Promise.resolve();

async function initPhp() {
  php = new PHP(await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 4242 } }));
  php.chdir('/');
  for (const d of ['/app/api', '/app/data', '/app/data/sessions', '/app/uploads', '/tmpup']) php.mkdirTree(d);
  for (const rel of walk(path.join(DIST, 'api'))) {
    if (rel.includes('/')) php.mkdirTree(`/app/api/${path.dirname(rel)}`);
    php.writeFile(`/app/api/${rel}`, fs.readFileSync(path.join(DIST, 'api', rel)));
  }
  php.writeFile('/app/data/.htaccess', 'Require all denied\n');
  php.writeFile('/app/uploads/.htaccess', 'Options -Indexes\n');
  // état persisté (db seedée + sessions/uploads éventuelles d'une session précédente)
  php.writeFile('/app/data/db.json', fs.readFileSync(path.join(DIST, 'data', 'db.json')));
  const sess = path.join(DIST, 'data', 'sessions');
  if (fs.existsSync(sess)) {
    for (const f of fs.readdirSync(sess)) {
      if (f.endsWith('.json')) php.writeFile(`/app/data/sessions/${f}`, fs.readFileSync(path.join(sess, f)));
    }
  }
  const up = path.join(DIST, 'uploads');
  if (fs.existsSync(up)) {
    for (const f of fs.readdirSync(up)) {
      if (f !== '.htaccess' && f !== '.gitkeep' && fs.statSync(path.join(up, f)).isFile()) {
        php.writeFile(`/app/uploads/${f}`, fs.readFileSync(path.join(up, f)));
      }
    }
  }
  console.log('▸ Runtime PHP 8.3 (WASM) initialisé — API opérationnelle');
}

/** Synchronise l'état modifiable du MEMFS vers le dist (uploads servis en statique). */
function persist() {
  try {
    fs.writeFileSync(path.join(DIST, 'data', 'db.json'), Buffer.from(php.readFileAsBuffer('/app/data/db.json')));
    const sessDir = path.join(DIST, 'data', 'sessions');
    fs.mkdirSync(sessDir, { recursive: true });
    const wasmSess = php.listFiles('/app/data/sessions').filter((f) => f.endsWith('.json'));
    for (const f of wasmSess) fs.writeFileSync(path.join(sessDir, f), Buffer.from(php.readFileAsBuffer(`/app/data/sessions/${f}`)));
    for (const f of fs.readdirSync(sessDir)) if (f.endsWith('.json') && !wasmSess.includes(f)) fs.rmSync(path.join(sessDir, f));
    const upDir = path.join(DIST, 'uploads');
    fs.mkdirSync(upDir, { recursive: true });
    const wasmUp = php.listFiles('/app/uploads').filter((f) => f !== '.htaccess');
    for (const f of wasmUp) fs.writeFileSync(path.join(upDir, f), Buffer.from(php.readFileAsBuffer(`/app/uploads/${f}`)));
    for (const f of fs.readdirSync(upDir)) if (f !== '.htaccess' && f !== '.gitkeep' && !wasmUp.includes(f)) fs.rmSync(path.join(upDir, f));
  } catch { /* état inchangé */ }
}

function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

/** Exécute une requête API dans le routeur PHP (binaire-sûr : PDF compris). */
async function runApi({ method, uri, headers, bodyBuf, files }) {
  const filesSpec = [];
  (files || []).forEach((f, i) => {
    php.writeFile(`/tmpup/${i}`, new Uint8Array(f.content));
    filesSpec.push({ name: f.name, tmp_name: `/tmpup/${i}`, size: f.content.length, error: 0 });
  });
  const host = String(headers.host || `localhost:${PORT}`);
  const origin = headers.origin ? String(headers.origin) : '';
  const boot = `<?php
$GLOBALS['TEST_INPUT'] = ${bodyBuf && bodyBuf.length ? `base64_decode('${b64(bodyBuf)}')` : "''"};
$GLOBALS['TEST_FILES'] = json_decode(base64_decode('${b64(JSON.stringify({ photos: filesSpec }))}'), true) ?: [];
$GLOBALS['TEST_HEADERS'] = [];
$_SERVER['REQUEST_METHOD'] = base64_decode('${b64(method)}');
$_SERVER['REQUEST_URI'] = base64_decode('${b64(uri)}');
$_SERVER['QUERY_STRING'] = base64_decode('${b64(uri.includes('?') ? uri.slice(uri.indexOf('?') + 1) : '')}');
$_SERVER['HTTP_HOST'] = base64_decode('${b64(host)}');
$_SERVER['SERVER_PROTOCOL'] = 'HTTP/1.1';
${origin ? `$_SERVER['HTTP_ORIGIN'] = base64_decode('${b64(origin)}');` : ''}
${headers.authorization ? `$_SERVER['HTTP_AUTHORIZATION'] = base64_decode('${b64(String(headers.authorization))}');` : ''}
$_COOKIE = json_decode(base64_decode('${b64(JSON.stringify(parseCookies(headers.cookie)))}'), true) ?: [];
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
    const rr = e?.response;
    const msg = (rr?.errors || rr?.text || String(e?.message || e)).slice(0, 400);
    console.error('▸ Erreur fatale PHP :', msg.split('\n')[0]);
    return {
      status: 500,
      headers: ['Content-Type: application/json; charset=utf-8'],
      body: Buffer.from(JSON.stringify({ error: 'Erreur interne du backend PHP' })),
    };
  }
  const bytes = Buffer.from(res.bytes ?? Buffer.from(res.text ?? '', 'utf8'));
  const iStatus = bytes.indexOf('\n@@STATUS@@');
  const iHeaders = bytes.indexOf('\n@@HEADERS@@');
  let body = bytes;
  let status = 200;
  let outHeaders = [];
  if (iStatus >= 0 && iHeaders > iStatus) {
    body = bytes.subarray(0, iStatus);
    status = parseInt(bytes.subarray(iStatus + '\n@@STATUS@@'.length, iHeaders).toString(), 10) || 200;
    try { outHeaders = JSON.parse(bytes.subarray(iHeaders + '\n@@HEADERS@@'.length).toString()); } catch { outHeaders = []; }
  }
  persist();
  return { status, headers: outHeaders, body };
}

/* ——— statique ——— */
function serveStatic(req, res, urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath.split('?')[0]); } catch { p = urlPath; }
  if (p === '/' || p === '') {
    res.writeHead(302, { Location: `${BASE}/` });
    return res.end();
  }
  if (!p.startsWith(BASE)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`Hors basePath — utilisez ${BASE}/…`);
  }
  let rel = p.slice(BASE.length) || '/';
  let file = path.resolve(path.join(DIST, rel));
  if (!file.startsWith(path.resolve(DIST))) {
    res.writeHead(403); return res.end('Interdit');
  }
  try {
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file.endsWith('.html') && !path.extname(file)) file += '/index.html';
  } catch { /* inexistant */ }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const nf = path.join(DIST, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.existsSync(nf) ? fs.createReadStream(nf).pipe(res) : res.end('404');
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': fs.statSync(file).size,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  fs.createReadStream(file).pipe(res);
}

/* ——— serveur ——— */
const server = http.createServer((req, res) => {
  const url = req.url || '/';
  const isApi = url.startsWith(`${BASE}/api/`) || url.startsWith(`${BASE}/api?`);
  if (!isApi) return serveStatic(req, res, url);

  // requêtes API : exécutées en série dans l'instance PHP unique
  queue = queue.then(async () => {
    const headers = req.headers;
    const ct = String(headers['content-type'] || '');
    let bodyBuf = Buffer.alloc(0);
    let files = [];
    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      const raw = await readBody(req);
      if (ct.startsWith('multipart/form-data')) {
        // parsing multipart natif (undici) → fichiers injectés dans le MEMFS
        const r = new Request(`http://${headers.host || 'localhost'}${url}`, {
          method: 'POST',
          headers: { 'content-type': ct },
          body: new Uint8Array(raw),
        });
        const fd = await r.formData();
        for (const [, v] of fd.entries()) {
          if (typeof v !== 'string' && v?.arrayBuffer) files.push({ name: v.name || 'file', content: Buffer.from(await v.arrayBuffer()) });
        }
      } else {
        bodyBuf = raw;
      }
    }
    const out = await runApi({ method: req.method, uri: url, headers, bodyBuf, files });
    const h = {};
    for (const line of out.headers) {
      const i = line.indexOf(': ');
      if (i <= 0) continue;
      const k = line.slice(0, i);
      const v = line.slice(i + 2);
      if (k.toLowerCase() === 'set-cookie') {
        h[k] = Array.isArray(h[k]) ? [...h[k], v] : [v];
      } else {
        h[k] = v;
      }
    }
    res.writeHead(out.status, h);
    res.end(out.body);
  }).catch((e) => {
    console.error('▸ Erreur requête API :', e?.message || e);
    try {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Erreur du serveur d’aperçu' }));
    } catch { /* réponse déjà envoyée */ }
  });
});

await initPhp();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`▸ Aperçu PHP sur http://0.0.0.0:${PORT}${BASE}/  (dist : ${DIST})`);
  console.log('  API exécutée via PHP-WASM — dashboard, formulaires, uploads et PDF fonctionnels.');
});
