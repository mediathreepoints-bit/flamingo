<?php
/**
 * ——— FLAMINGO AUTO KÉNITRA — backend PHP (Hostinger mutualisé) ———
 * Port fidèle de la logique serveur Next.js : lib/db.ts, lib/repo.ts (mode local),
 * lib/api.ts, lib/billing.ts, lib/promo.ts, lib/format.ts, app/api/**.
 * PHP >= 8.0, aucune extension requise au-delà du cœur (json).
 */
declare(strict_types=1);

/* ————————————————— Racine & configuration ————————————————— */

function app_root(): string
{
    return dirname(__DIR__);
}

function cfg(): array
{
    static $c = null;
    if ($c === null) {
        $c = require __DIR__ . '/config.php';
    }
    return $c;
}

function cli_mode(): bool
{
    /* « cli » = hors Apache : CLI réel, SAPI « wasm » (harnais de test PHP-WASM),
       ou présence des globales de test. En production (apache2handler, litespeed,
       cgi-fcgi, fpm-fcgi) cette fonction renvoie toujours false. */
    return PHP_SAPI === 'cli' || PHP_SAPI === 'wasm' || isset($GLOBALS['TEST_INPUT']);
}

/* ————— Abstractions d'entrée/sortie (testables hors Apache) ————— */

function req_raw_body(): string
{
    if (cli_mode()) {
        return (string)($GLOBALS['TEST_INPUT'] ?? '');
    }
    return (string)(file_get_contents('php://input') ?: '');
}

/** Fichiers téléversés normalisés : liste de ['name','tmp_name','size','error']. */
function req_files(string $field): array
{
    if (cli_mode()) {
        return $GLOBALS['TEST_FILES'][$field] ?? [];
    }
    $f = $_FILES[$field] ?? null;
    if (!$f) {
        return [];
    }
    if (!is_array($f['name'])) {
        return [$f];
    }
    $out = [];
    foreach ($f['name'] as $i => $n) {
        $out[] = [
            'name' => $n,
            'tmp_name' => $f['tmp_name'][$i],
            'size' => $f['size'][$i],
            'error' => $f['error'][$i],
        ];
    }
    return $out;
}

function out_header(string $k, string $v): void
{
    if (cli_mode()) {
        $GLOBALS['TEST_HEADERS'][] = "$k: $v";
        return;
    }
    header("$k: $v");
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function out_cookie(string $name, string $value, int $expire, string $path): void
{
    $parts = "$name=$value; Path=$path; Expires=" . gmdate('D, d M Y H:i:s', $expire) . ' GMT; HttpOnly; SameSite=Lax' . (is_https() ? '; Secure' : '');
    if (cli_mode()) {
        $GLOBALS['TEST_HEADERS'][] = "Set-Cookie: $parts";
        return;
    }
    setcookie($name, $value, [
        'expires' => $expire,
        'path' => $path,
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

/* ————————————————— Réponses JSON ————————————————— */

function json_out($data, int $status = 200): void
{
    http_response_code($status);
    out_header('Content-Type', 'application/json; charset=utf-8');
    out_header('Cache-Control', 'no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_err(string $msg, int $status): void
{
    json_out(['error' => $msg], $status);
}

/* ————————————————— Base de données JSON —————————————————
 * data/db.json — même format que le mode local Node (data/db.json).
 * Verrou exclusif + écriture atomique (tmp + rename). */

const COLLECTIONS = [
    'customers', 'vehicles', 'repairs', 'quotes', 'invoices', 'payments',
    'expenses', 'appointments', 'gallery', 'quoteRequests', 'messages',
    'promotions', 'services',
];

function db_file(): string
{
    return app_root() . '/data/db.json';
}

function default_settings(): array
{
    // Valeurs officielles identiques à lib/site.ts (OFFICIAL / DEFAULT_SETTINGS)
    return [
        'brand' => 'FLAMINGO AUTO',
        'city' => 'KÉNITRA',
        'cityLabel' => 'Kénitra, Maroc',
        'phone' => '0661 50 86 74',
        'phoneRaw' => '+212661508674',
        'whatsapp' => '212661508674',
        'instagram' => 'https://www.instagram.com/flamingo_auto_kenitra/',
        'instagramHandle' => '@flamingo_auto_kenitra',
        'sloganFr' => 'Votre confiance, notre responsabilité.',
        'sloganAr' => 'ثقتكم مسؤوليتنا',
        'heroEyebrow' => 'Votre carrossier de confiance à Kénitra',
        'heroTitle1' => 'UNE NOUVELLE ÉQUIPE.',
        'heroTitle2' => 'UN NOUVEL ÉLAN.',
        'heroSubtitle' => 'Carrosserie • Peinture au four • Polissage & Rénovation à Kénitra',
        'mapUrl' => 'https://www.google.com/maps/search/?api=1&query=K%C3%A9nitra%2C%20Maroc',
        'mapEmbed' => 'https://www.google.com/maps?q=K%C3%A9nitra%2C%20Maroc&z=12&output=embed',
        'legal' => 'FLAMINGO AUTO KÉNITRA — Kénitra, Maroc',
    ];
}

function db_normalize($j): array
{
    $db = ['settings' => default_settings()];
    foreach (COLLECTIONS as $c) {
        $db[$c] = [];
    }
    if (is_array($j)) {
        foreach (COLLECTIONS as $c) {
            if (isset($j[$c]) && is_array($j[$c])) {
                $db[$c] = array_values($j[$c]);
            }
        }
        if (isset($j['settings']) && is_array($j['settings'])) {
            $db['settings'] = array_merge($db['settings'], $j['settings']);
        }
    }
    return $db;
}

function db_load(): array
{
    $f = db_file();
    if (is_file($f)) {
        $j = json_decode((string)file_get_contents($f), true);
        return db_normalize($j);
    }
    return db_normalize(null);
}

/** Verrou exclusif inter-processus (à prendre AVANT db_load, relâcher APRÈS db_save). */
function db_lock()
{
    $dir = dirname(db_file());
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $fp = fopen(db_file() . '.lock', 'c');
    if ($fp) {
        flock($fp, LOCK_EX);
    }
    return $fp;
}

function db_unlock($fp): void
{
    if ($fp) {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

function db_save(array $db): void
{
    $dir = dirname(db_file());
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $tmp = db_file() . '.tmp-' . getmypid();
    $ok = file_put_contents(
        $tmp,
        json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
    if ($ok === false) {
        json_err('Écriture de la base impossible (permissions ?)', 500);
    }
    rename($tmp, db_file());
}

/* ————————————————— Helpers métier (lib/format.ts) ————————————————— */

function uid(string $prefix): string
{
    $ms = (int)round(microtime(true) * 1000);
    return $prefix . '_' . strtolower(base_convert((string)$ms, 10, 36)) . substr(bin2hex(random_bytes(3)), 0, 6);
}

function today_iso(): string
{
    return date('Y-m-d');
}

function now_iso(): string
{
    return gmdate('Y-m-d\TH:i:s.v\Z');
}

/** mbstring optionnelle : replis cœur PHP (UTF-8 sûr). */
function u_strlen(string $s): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($s, 'UTF-8');
    }
    return preg_match_all('/./us', $s);
}

function u_substr(string $s, int $len): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($s, 0, $len, 'UTF-8');
    }
    $m = [];
    preg_match_all('/./us', $s, $m);
    return implode('', array_slice($m[0], 0, $len));
}

function money_fmt(float $n, bool $decimals = false): string
{
    return number_format(is_finite($n) ? $n : 0.0, $decimals ? 2 : 0, ',', ' ') . ' MAD';
}

function fr_date(?string $iso): string
{
    if (!$iso) {
        return '';
    }
    $ts = strtotime($iso);
    return $ts === false ? '' : date('d/m/Y', $ts);
}

/* ————————————————— Facturation (lib/billing.ts) ————————————————— */

function line_totals(array $items, float $discount = 0, float $tva = 20): array
{
    $ht = 0.0;
    foreach ($items as $it) {
        $ht += (float)($it['qty'] ?? 0) * (float)($it['price'] ?? 0);
    }
    $after = max(0, $ht - $discount);
    $tvaAmount = $after * $tva / 100;
    return ['ht' => $ht, 'discount' => $discount, 'tvaAmount' => $tvaAmount, 'ttc' => $after + $tvaAmount];
}

function invoice_paid(array $payments, string $invoiceId): float
{
    $s = 0.0;
    foreach ($payments as $p) {
        if (($p['invoiceId'] ?? '') === $invoiceId) {
            $s += (float)($p['amount'] ?? 0);
        }
    }
    return $s;
}

function invoice_due(array $inv): float
{
    return line_totals($inv['items'] ?? [], (float)($inv['discount'] ?? 0), (float)($inv['tva'] ?? 20))['ttc'];
}

function compute_invoice_status(array $payments, array $inv): string
{
    $paid = invoice_paid($payments, (string)($inv['id'] ?? ''));
    $due = invoice_due($inv);
    $today = today_iso();
    $dueAt = $inv['dueAt'] ?? '';
    if ($due > 0 && $paid >= $due) {
        return 'payee';
    }
    if ($paid > 0) {
        return ($dueAt && $dueAt < $today) ? 'en_retard' : 'partielle';
    }
    if ($dueAt && $dueAt < $today) {
        return 'en_retard';
    }
    return 'emise';
}

function refresh_invoices(array &$db): void
{
    foreach ($db['invoices'] as $i => $inv) {
        $status = compute_invoice_status($db['payments'], $inv);
        if (($inv['status'] ?? '') !== $status) {
            $db['invoices'][$i]['status'] = $status;
        }
    }
}

/* ————————————————— CRUD métier (lib/api.ts) ————————————————— */

function next_ref(array $db, string $entity, string $prefix): string
{
    $year = (int)date('Y');
    $max = 0;
    foreach ($db[$entity] ?? [] as $r) {
        if (preg_match('/^' . preg_quote($prefix, '/') . '-' . $year . '-(\d+)$/', (string)($r['ref'] ?? ''), $m)) {
            $max = max($max, (int)$m[1]);
        }
    }
    return sprintf('%s-%d-%04d', $prefix, $year, $max + 1);
}

/** Création avec valeurs par défaut métier — port exact du switch de apiCreate(). */
function api_create(array &$db, string $entity, array $body): array
{
    $base = $body;
    if (empty($base['id'])) {
        $base['id'] = uid(substr($entity, 0, 2));
    }
    switch ($entity) {
        case 'customers':
            $base['createdAt'] = $base['createdAt'] ?? now_iso();
            break;
        case 'repairs':
            $status = $base['status'] ?? 'diagnostic';
            $base['ref'] = $base['ref'] ?? next_ref($db, 'repairs', 'REP');
            $base['status'] = $status;
            $base['priority'] = $base['priority'] ?? 'normale';
            $base['createdAt'] = $base['createdAt'] ?? now_iso();
            $base['history'] = [['at' => now_iso(), 'status' => $status]];
            break;
        case 'quotes':
            $base['ref'] = $base['ref'] ?? next_ref($db, 'quotes', 'DV');
            $base['items'] = $base['items'] ?? [];
            $base['discount'] = $base['discount'] ?? 0;
            $base['tva'] = $base['tva'] ?? 20;
            $base['status'] = $base['status'] ?? 'brouillon';
            $base['source'] = $base['source'] ?? 'atelier';
            $base['createdAt'] = $base['createdAt'] ?? now_iso();
            break;
        case 'invoices':
            $base['ref'] = $base['ref'] ?? next_ref($db, 'invoices', 'FA');
            $base['items'] = $base['items'] ?? [];
            $base['discount'] = $base['discount'] ?? 0;
            $base['tva'] = $base['tva'] ?? 20;
            $base['status'] = $base['status'] ?? 'emise';
            $base['issuedAt'] = $base['issuedAt'] ?? now_iso();
            break;
        case 'payments':
            $base['date'] = $base['date'] ?? today_iso();
            $base['method'] = $base['method'] ?? 'especes';
            $base['type'] = $base['type'] ?? 'paiement';
            break;
        case 'appointments':
            $base['status'] = $base['status'] ?? 'confirme';
            break;
        case 'promotions':
            $base['services'] = $base['services'] ?? [];
            $base['percent'] = (float)($base['percent'] ?? 0);
            $base['active'] = ($base['active'] ?? false) === true;
            $base['start'] = $base['start'] ?? '';
            $base['end'] = $base['end'] ?? '';
            $base['terms'] = $base['terms'] ?? '';
            $base['createdAt'] = $base['createdAt'] ?? now_iso();
            break;
        case 'gallery':
            $base['year'] = $base['year'] ?? (int)date('Y');
            break;
        case 'quoteRequests':
            $base['createdAt'] = $base['createdAt'] ?? now_iso();
            $base['status'] = $base['status'] ?? 'nouveau';
            $base['photos'] = $base['photos'] ?? [];
            break;
        case 'messages':
            $base['createdAt'] = $base['createdAt'] ?? now_iso();
            $base['status'] = $base['status'] ?? 'nouveau';
            break;
        case 'expenses':
            $base['createdAt'] = $base['createdAt'] ?? now_iso();
            $base['amount'] = (float)($base['amount'] ?? 0);
            $base['date'] = $base['date'] ?? today_iso();
            break;
    }
    $db[$entity][] = $base;
    if ($entity === 'payments' || $entity === 'invoices') {
        refresh_invoices($db);
    }
    return $base;
}

function api_patch(array &$db, string $entity, string $id, array $body): ?array
{
    $idx = null;
    foreach ($db[$entity] as $i => $r) {
        if (($r['id'] ?? '') === $id) {
            $idx = $i;
            break;
        }
    }
    if ($idx === null) {
        return null;
    }
    if ($entity === 'repairs' && !empty($body['status'])) {
        $current = $db['repairs'][$idx];
        if (($current['status'] ?? '') !== $body['status']) {
            $history = $current['history'] ?? [];
            $h = ['at' => now_iso(), 'status' => $body['status']];
            if (isset($body['note'])) {
                $h['note'] = (string)$body['note'];
            }
            $history[] = $h;
            $body['history'] = $history;
            $body['deliveredDate'] = $body['status'] === 'livre' ? today_iso() : ($current['deliveredDate'] ?? null);
        }
    }
    $merged = array_merge($db[$entity][$idx], $body, ['id' => $id]);
    $db[$entity][$idx] = $merged;
    if ($entity === 'payments' || $entity === 'invoices') {
        refresh_invoices($db);
    }
    return $merged;
}

function api_delete(array &$db, string $entity, string $id): bool
{
    foreach ($db[$entity] as $i => $r) {
        if (($r['id'] ?? '') === $id) {
            array_splice($db[$entity], $i, 1);
            if ($entity === 'payments') {
                refresh_invoices($db);
            }
            return true;
        }
    }
    return false;
}

function row_get(array $db, string $entity, string $id): ?array
{
    foreach ($db[$entity] ?? [] as $r) {
        if (($r['id'] ?? '') === $id) {
            return $r;
        }
    }
    return null;
}

/** Devis accepté → facture (port de convertQuote). */
function convert_quote(array &$db, string $quoteId): ?array
{
    $quote = row_get($db, 'quotes', $quoteId);
    if (!$quote) {
        return null;
    }
    $invoice = api_create($db, 'invoices', [
        'customerId' => $quote['customerId'] ?? '',
        'vehicleId' => $quote['vehicleId'] ?? '',
        'quoteId' => $quote['id'],
        'items' => $quote['items'] ?? [],
        'discount' => $quote['discount'] ?? 0,
        'tva' => $quote['tva'] ?? 20,
        'notes' => 'Issue du devis ' . ($quote['ref'] ?? ''),
    ]);
    api_patch($db, 'quotes', $quoteId, ['status' => 'facture']);
    return $invoice;
}

/* ————————————————— Promotions (lib/promo.ts) ————————————————— */

function active_promotion(array $rows): ?array
{
    $now = time();
    $today = date('Y-m-d');
    $within = [];
    foreach ($rows as $p) {
        if (!is_array($p) || ($p['active'] ?? false) !== true || !((float)($p['percent'] ?? 0) > 0)) {
            continue;
        }
        if (!empty($p['start']) && $today < $p['start']) {
            continue;
        }
        if (!empty($p['end']) && $today > $p['end']) {
            continue;
        }
        $within[] = $p;
    }
    if (!$within) {
        return null;
    }
    usort($within, fn($a, $b) => (float)$b['percent'] <=> (float)$a['percent']);
    return $within[0];
}

/* ————————————————— Sessions (fichiers, sans extension) ————————————————— */

function sess_dir(): string
{
    return app_root() . '/data/sessions';
}

function sess_current(): ?array
{
    $name = cfg()['cookie'];
    $id = (string)($_COOKIE[$name] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $id)) {
        /* Repli « Authorization: Bearer <id> » : indispensable dans les iframes
           d'aperçu où les cookies SameSite sont bloqués par le navigateur.
           Sur Hostinger en même origine, le cookie reste le chemin normal. */
        $h = (string)($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        if (preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $h, $m)) {
            $id = $m[1];
        }
    }
    if (!preg_match('/^[a-f0-9]{64}$/', $id)) {
        return null;
    }
    $f = sess_dir() . "/$id.json";
    if (!is_file($f)) {
        return null;
    }
    $j = json_decode((string)file_get_contents($f), true);
    if (!is_array($j) || (int)($j['exp'] ?? 0) < time()) {
        @unlink($f);
        return null;
    }
    return ['id' => $id, 'user' => (string)($j['user'] ?? 'admin')];
}

function sess_create(string $user): string
{
    $dir = sess_dir();
    if (!is_dir($dir)) {
        mkdir($dir, 0700, true);
        @file_put_contents($dir . '/.htaccess', "Require all denied\n");
    }
    foreach (glob($dir . '/*.json') ?: [] as $f) {
        $j = json_decode((string)file_get_contents($f), true);
        if (!is_array($j) || (int)($j['exp'] ?? 0) < time()) {
            @unlink($f);
        }
    }
    $id = bin2hex(random_bytes(32));
    $c = cfg();
    file_put_contents("$dir/$id.json", json_encode([
        'user' => $user,
        'iat' => time(),
        'exp' => time() + (int)$c['session_ttl'],
    ]));
    @chmod("$dir/$id.json", 0600);
    $path = $c['base_path'] !== '' ? $c['base_path'] : '/';
    out_cookie($c['cookie'], $id, time() + (int)$c['session_ttl'], $path);
    return $id;
}

function sess_destroy(): void
{
    $s = sess_current();
    if ($s) {
        @unlink(sess_dir() . "/{$s['id']}.json");
    }
    $c = cfg();
    out_cookie($c['cookie'], '', time() - 3600, $c['base_path'] !== '' ? $c['base_path'] : '/');
}

/** Protection des routes admin : session valide + durcissement anti-CSRF (Origin). */
function require_auth(): array
{
    if (!cli_mode()) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '') {
            $oh = parse_url($origin, PHP_URL_HOST);
            $hh = strtolower(explode(':', (string)($_SERVER['HTTP_HOST'] ?? ''))[0]);
            if ($oh && strcasecmp((string)$oh, $hh) !== 0) {
                json_err('Origine refusée', 403);
            }
        }
    }
    $s = sess_current();
    if (!$s) {
        json_err('Non autorisé', 401);
    }
    return $s;
}

/* ————————————————— Uploads (app/api/upload) ————————————————— */

function sniff_image(string $b): ?string
{
    if (strncmp($b, "\xFF\xD8\xFF", 3) === 0) {
        return 'jpg';
    }
    if (strncmp($b, "\x89PNG\r\n\x1a\n", 8) === 0) {
        return 'png';
    }
    if (strncmp($b, 'RIFF', 4) === 0 && substr($b, 8, 4) === 'WEBP') {
        return 'webp';
    }
    if (strncmp($b, 'GIF87a', 6) === 0 || strncmp($b, 'GIF89a', 6) === 0) {
        return 'gif';
    }
    return null;
}

function handle_upload(): array
{
    $files = req_files('photos');
    if (!$files) {
        json_err('Aucun fichier reçu', 400);
    }
    if (count($files) > 6) {
        json_err('Maximum 6 photos', 400);
    }
    $dir = app_root() . '/uploads';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $saved = [];
    foreach ($files as $f) {
        if ((int)($f['error'] ?? 4) !== 0) {
            json_err('Envoi échoué', 400);
        }
        if ((int)($f['size'] ?? 0) > 10 * 1024 * 1024) {
            json_err('Chaque photo doit être une image de moins de 10 Mo', 400);
        }
        $data = (string)@file_get_contents((string)$f['tmp_name']);
        $kind = sniff_image($data);
        if (!$kind) {
            json_err('Chaque photo doit être une image de moins de 10 Mo', 400);
        }
        $name = (int)round(microtime(true) * 1000) . '-' . substr(bin2hex(random_bytes(3)), 0, 6) . '.' . $kind;
        if (file_put_contents("$dir/$name", $data) === false) {
            json_err("Erreur lors de l'envoi", 500);
        }
        $saved[] = "/uploads/$name";
    }
    return $saved;
}
