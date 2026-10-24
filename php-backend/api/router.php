<?php
/**
 * ——— FLAMINGO AUTO KÉNITRA — routeur API PHP ———
 * Miroir des routes API Next.js pour l'hébergement mutualisé Hostinger.
 * Toutes les requêtes /api/* sont réécrites vers ce fichier (.htaccess).
 *
 *  POST   /api/auth/login            → { ok:true, token } + cookie de session
 *  POST   /api/auth/logout           → { ok:true }
 *  GET    /api/auth/me               → { user }
 *  GET    /api/public/site-data      → { gallery, promotion, services } (public)
 *  POST   /api/quote                 → demande de devis publique { ok, id }
 *  POST   /api/contact               → message de contact public { ok }
 *  POST   /api/upload                → photos (public, images uniquement) { paths }
 *  GET    /api/admin/{entity}        → { rows }                 [auth]
 *  POST   /api/admin/{entity}        → { ok, record }           [auth]
 *  GET    /api/admin/{entity}/{id}   → { record }               [auth]
 *  PATCH  /api/admin/{entity}/{id}   → { ok, record }           [auth]
 *  DELETE /api/admin/{entity}/{id}   → { ok }                   [auth]
 *  GET    /api/admin/settings        → { settings }             [auth]
 *  PATCH  /api/admin/settings        → { ok }                   [auth]
 *  POST   /api/admin/convert-quote   → { ok, invoice }          [auth]
 *  GET    /api/pdf/{quote|invoice}/{id} → PDF                   [auth]
 */
declare(strict_types=1);

require __DIR__ . '/lib.php';

const ALLOWED = [
    'customers', 'vehicles', 'repairs', 'quotes', 'invoices',
    'payments', 'expenses', 'appointments', 'gallery', 'quoteRequests', 'messages',
    'promotions', 'services',
];

$uri = (string)(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$pos = strpos($uri, '/api/');
$rel = $pos === false ? trim($uri, '/') : trim(substr($uri, $pos + 5), '/');
$seg = $rel === '' ? [] : explode('/', $rel);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$s0 = $seg[0] ?? '';
$s1 = $seg[1] ?? '';
$s2 = $seg[2] ?? '';

/* ————————————————— auth ————————————————— */

if ($s0 === 'auth') {
    if ($s1 === 'login' && $method === 'POST') {
        $body = json_decode(req_raw_body(), true) ?: [];
        $identifier = trim((string)($body['identifier'] ?? ''));
        $password = (string)($body['password'] ?? '');
        $c = cfg();
        if ($identifier !== $c['admin_user'] || !password_verify($password, $c['admin_password_hash'])) {
            json_err('Identifiants invalides', 401);
        }
        $sid = sess_create($identifier);
        /* token = id de session : le front le stocke (sessionStorage/URL ?atk=)
           et le renvoie en Authorization: Bearer quand les cookies sont bloqués
           (aperçu dans une iframe). */
        json_out(['ok' => true, 'token' => $sid]);
    }
    if ($s1 === 'logout' && $method === 'POST') {
        sess_destroy();
        json_out(['ok' => true]);
    }
    if ($s1 === 'me' && $method === 'GET') {
        $s = sess_current();
        if (!$s) {
            json_err('Non autorisé', 401);
        }
        json_out(['user' => $s['user']]);
    }
    json_err('Route inconnue', 404);
}

/* ————————————————— données publiques du site ————————————————— */

if ($s0 === 'public' && $s1 === 'site-data' && $method === 'GET') {
    $db = db_load();
    json_out([
        'gallery' => $db['gallery'],
        'promotion' => active_promotion($db['promotions']),
        'services' => $db['services'],
    ]);
}

/* ————————————————— formulaires publics ————————————————— */

if ($s0 === 'quote' && $method === 'POST') {
    $body = json_decode(req_raw_body(), true) ?: [];
    $name = trim((string)($body['name'] ?? ''));
    $phone = preg_replace('/[^\d+]/', '', (string)($body['phone'] ?? ''));
    if (strlen($name) < 2) {
        json_err('Veuillez indiquer votre nom', 400);
    }
    if (strlen($phone) < 9) {
        json_err('Numéro de téléphone invalide', 400);
    }
    $photos = is_array($body['photos'] ?? null) ? array_slice(array_map('strval', $body['photos']), 0, 6) : [];
    $rec = [
        'id' => uid('qr'),
        'name' => $name,
        'phone' => $phone,
        'brand' => trim((string)($body['brand'] ?? '')),
        'model' => trim((string)($body['model'] ?? '')),
        'year' => trim((string)($body['year'] ?? '')),
        'repairType' => trim((string)($body['repairType'] ?? '')),
        'message' => u_substr(trim((string)($body['message'] ?? '')), 2000),
        'photos' => $photos,
        'createdAt' => now_iso(),
        'status' => 'nouveau',
    ];
    $lock = db_lock();
    $db = db_load();
    $db['quoteRequests'][] = $rec;
    db_save($db);
    db_unlock($lock);
    json_out(['ok' => true, 'id' => $rec['id']]);
}

if ($s0 === 'contact' && $method === 'POST') {
    $body = json_decode(req_raw_body(), true) ?: [];
    $name = trim((string)($body['name'] ?? ''));
    $message = trim((string)($body['message'] ?? ''));
    $email = trim((string)($body['email'] ?? ''));
    $phone = preg_replace('/[^\d+]/', '', (string)($body['phone'] ?? ''));
    if (strlen($name) < 2) {
        json_err('Veuillez indiquer votre nom', 400);
    }
    if (strlen($message) < 10) {
        json_err('Message trop court', 400);
    }
    if ($email === '' && $phone === '') {
        json_err('Indiquez un email ou un téléphone', 400);
    }
    $rec = [
        'id' => uid('ms'),
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'message' => u_substr($message, 4000),
        'createdAt' => now_iso(),
        'status' => 'nouveau',
    ];
    $lock = db_lock();
    $db = db_load();
    $db['messages'][] = $rec;
    db_save($db);
    db_unlock($lock);
    json_out(['ok' => true]);
}

if ($s0 === 'upload' && $method === 'POST') {
    json_out(['paths' => handle_upload()]);
}

/* ————————————————— admin ————————————————— */

if ($s0 === 'admin') {
    require_auth();

    if ($s1 === 'settings') {
        if ($method === 'GET') {
            $db = db_load();
            json_out(['settings' => $db['settings']]);
        }
        if ($method === 'PATCH' || $method === 'PUT') {
            $body = json_decode(req_raw_body(), true);
            if (!is_array($body)) {
                json_err('Requête invalide', 400);
            }
            $lock = db_lock();
            $db = db_load();
            foreach ($body as $k => $v) {
                if (is_string($v)) {
                    $db['settings'][(string)$k] = trim($v);
                }
            }
            db_save($db);
            db_unlock($lock);
            json_out(['ok' => true]);
        }
        json_err('Méthode non autorisée', 405);
    }

    if ($s1 === 'convert-quote' && $method === 'POST') {
        $body = json_decode(req_raw_body(), true) ?: [];
        $quoteId = (string)($body['quoteId'] ?? '');
        $lock = db_lock();
        $db = db_load();
        $invoice = convert_quote($db, $quoteId);
        if ($invoice === null) {
            db_unlock($lock);
            json_err('Devis introuvable', 404);
        }
        db_save($db);
        db_unlock($lock);
        json_out(['ok' => true, 'invoice' => $invoice]);
    }

    if (in_array($s1, ALLOWED, true)) {
        $entity = $s1;

        if ($s2 === '') {
            if ($method === 'GET') {
                $db = db_load();
                json_out(['rows' => $db[$entity]]);
            }
            if ($method === 'POST') {
                $body = json_decode(req_raw_body(), true);
                if (!is_array($body)) {
                    json_err('Requête invalide', 400);
                }
                $lock = db_lock();
                $db = db_load();
                $rec = api_create($db, $entity, $body);
                db_save($db);
                db_unlock($lock);
                json_out(['ok' => true, 'record' => $rec]);
            }
            json_err('Méthode non autorisée', 405);
        }

        $id = $s2;
        if ($method === 'GET') {
            $db = db_load();
            $rec = row_get($db, $entity, $id);
            if (!$rec) {
                json_err('Introuvable', 404);
            }
            json_out(['record' => $rec]);
        }
        if ($method === 'PATCH' || $method === 'PUT') {
            $body = json_decode(req_raw_body(), true);
            if (!is_array($body)) {
                json_err('Requête invalide', 400);
            }
            $lock = db_lock();
            $db = db_load();
            $rec = api_patch($db, $entity, $id, $body);
            if ($rec === null) {
                db_unlock($lock);
                json_err('Introuvable', 404);
            }
            db_save($db);
            db_unlock($lock);
            json_out(['ok' => true, 'record' => $rec]);
        }
        if ($method === 'DELETE') {
            $lock = db_lock();
            $db = db_load();
            $ok = api_delete($db, $entity, $id);
            if (!$ok) {
                db_unlock($lock);
                json_err('Introuvable', 404);
            }
            db_save($db);
            db_unlock($lock);
            json_out(['ok' => true]);
        }
        json_err('Méthode non autorisée', 405);
    }

    json_err('Entité inconnue', 404);
}

/* ————————————————— PDF (devis / facture) ————————————————— */

if ($s0 === 'pdf' && $method === 'GET') {
    require_auth();
    $doc = $s1;
    $id = $s2;
    if (!in_array($doc, ['quote', 'invoice'], true) || $id === '') {
        json_err('Document inconnu', 404);
    }
    require __DIR__ . '/pdf.php';
    $db = db_load();
    $settings = $db['settings'];

    if ($doc === 'invoice') {
        $inv = row_get($db, 'invoices', $id);
        if (!$inv) {
            json_err('Facture introuvable', 404);
        }
        $client = ($inv['customerId'] ?? '') ? row_get($db, 'customers', $inv['customerId']) : null;
        $vehicle = ($inv['vehicleId'] ?? '') ? row_get($db, 'vehicles', $inv['vehicleId']) : null;
        $payments = array_values(array_filter($db['payments'], fn($p) => ($p['invoiceId'] ?? '') === $inv['id']));
        $pdfstr = invoice_pdf($inv, $settings, $client, $vehicle, $payments);
        $filename = ($inv['ref'] ?? 'facture') . '.pdf';
    } else {
        $q = row_get($db, 'quotes', $id);
        if (!$q) {
            json_err('Devis introuvable', 404);
        }
        $client = ($q['customerId'] ?? '') ? row_get($db, 'customers', $q['customerId']) : null;
        $vehicle = ($q['vehicleId'] ?? '') ? row_get($db, 'vehicles', $q['vehicleId']) : null;
        $pdfstr = quote_pdf($q, $settings, $client, $vehicle);
        $filename = ($q['ref'] ?? 'devis') . '.pdf';
    }

    http_response_code(200);
    out_header('Content-Type', 'application/pdf');
    out_header('Content-Disposition', 'inline; filename="' . $filename . '"');
    out_header('Cache-Control', 'no-store');
    out_header('Content-Length', (string)strlen($pdfstr));
    echo $pdfstr;
    exit;
}

json_err('Route inconnue', 404);
