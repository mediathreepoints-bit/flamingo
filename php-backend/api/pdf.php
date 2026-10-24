<?php
/**
 * ——— FLAMINGO AUTO KÉNITRA — PDF devis/facture (variante PHP) ———
 * Port de lib/pdf.ts (pdfkit) vers FPDF : mêmes cotes en points A4, mêmes
 * couleurs de marque, même structure (bandeau d'en-tête, emblème flamingo
 * vectoriel, encadrés client/véhicule, tableau de lignes, bloc totaux, pied).
 * Police Helvetica (comme l'original). Sortie mono-page, comme l'original.
 */
declare(strict_types=1);

require_once __DIR__ . '/vendor/fpdf.php';

class FlamingoPDF extends FPDF
{
    private const K = 0.5522847498; // approximation du cercle en béziers

    public function __construct()
    {
        parent::__construct('P', 'pt', 'A4');
        $this->SetAutoPageBreak(false);
        $this->SetTitle('Flamingo Auto Kénitra');
        $this->SetAuthor('Flamingo Auto Kénitra');
        $this->AddPage();
    }

    /* ——— helpers couleur/espacement ——— */

    public function rgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];
    }

    public function setTc(float $v): void
    {
        $this->_out(sprintf('%.3F Tc', $v));
    }

    public function font(string $style, float $size): void
    {
        $this->SetFont($style === 'B' ? 'Helvetica' : 'Helvetica', $style, $size);
    }

    /** Texte aligné à gauche — $y = bord haut (comme pdfkit), conversion ligne de base. */
    public function txt(float $x, float $yTop, float $size, string $style, string $color, string $str, float $spacing = 0): void
    {
        [$r, $g, $b] = $this->rgb($color);
        $this->SetTextColor($r, $g, $b);
        $this->font($style, $size);
        if ($spacing > 0) {
            $this->setTc($spacing);
        }
        $this->Text($x, $yTop + $size * 0.82, $str);
        if ($spacing > 0) {
            $this->setTc(0);
        }
    }

    /** Texte aligné à droite se terminant à $xEnd (espacement inclus). */
    public function txtR(float $xEnd, float $yTop, float $size, string $style, string $color, string $str, float $spacing = 0): void
    {
        [$r, $g, $b] = $this->rgb($color);
        $this->SetTextColor($r, $g, $b);
        $this->font($style, $size);
        $w = $this->GetStringWidth($str);
        if ($spacing > 0) {
            $w += $spacing * max(0, u_strlen($str) - 1);
        }
        $this->txt($xEnd - $w, $yTop, $size, $style, $color, $str, $spacing);
    }

    public function trunc(string $s, float $maxw): string
    {
        if ($this->GetStringWidth($s) <= $maxw) {
            return $s;
        }
        while (u_strlen($s) > 1 && $this->GetStringWidth($s . '…') > $maxw) {
            $s = u_substr($s, u_strlen($s) - 1);
        }
        return $s . '…';
    }

    /* ——— primitives vectorielles brutes (repère PDF : origine en bas) ——— */

    public function yf(float $yTop): float
    {
        return $this->h - $yTop;
    }

    public function roundRectPath(float $x, float $y, float $w, float $h, float $r): void
    {
        $k = self::K * $r;
        $yb = $this->yf($y + $h); // bas (repère PDF)
        $yt = $this->yf($y);      // haut
        $op = sprintf('%.2F %.2F m', $x + $r, $yt);
        $op .= sprintf(' %.2F %.2F l', $x + $w - $r, $yt);
        $op .= sprintf(' %.2F %.2F %.2F %.2F %.2F %.2F c', $x + $w - $r + $k, $yt, $x + $w, $yt + $r - $k, $x + $w, $yt + $r);
        $op .= sprintf(' %.2F %.2F l', $x + $w, $yb - $r);
        $op .= sprintf(' %.2F %.2F %.2F %.2F %.2F %.2F c', $x + $w, $yb - $r + $k, $x + $w - $r + $k, $yb, $x + $w - $r, $yb);
        $op .= sprintf(' %.2F %.2F l', $x + $r, $yb);
        $op .= sprintf(' %.2F %.2F %.2F %.2F %.2F %.2F c', $x + $r - $k, $yb, $x, $yb - $r + $k, $x, $yb - $r);
        $op .= sprintf(' %.2F %.2F l', $x, $yt + $r);
        $op .= sprintf(' %.2F %.2F %.2F %.2F %.2F %.2F c', $x, $yt + $r - $k, $x + $r - $k, $yt, $x + $r, $yt);
        $this->_out($op);
    }

    public function roundRectFill(float $x, float $y, float $w, float $h, float $r, string $color): void
    {
        [$cr, $cg, $cb] = $this->rgb($color);
        $this->SetFillColor($cr, $cg, $cb);
        $this->roundRectPath($x, $y, $w, $h, $r);
        $this->_out('f');
    }

    public function circleFill(float $cx, float $cyTop, float $r, string $color): void
    {
        [$cr, $cg, $cb] = $this->rgb($color);
        $this->SetFillColor($cr, $cg, $cb);
        $k = self::K * $r;
        $y = $this->yf($cyTop);
        $op = sprintf('%.2F %.2F m', $cx + $r, $y);
        $op .= sprintf(' %.2F %.2F %.2F %.2F %.2F %.2F c', $cx + $r, $y + $k, $cx + $k, $y + $r, $cx, $y + $r);
        $op .= sprintf(' %.2F %.2F %.2F %.2F %.2F %.2F c', $cx - $k, $y + $r, $cx - $r, $y + $k, $cx - $r, $y);
        $op .= sprintf(' %.2F %.2F %.2F %.2F %.2F %.2F c', $cx - $r, $y - $k, $cx - $k, $y - $r, $cx, $y - $r);
        $op .= sprintf(' %.2F %.2F %.2F %.2F %.2F %.2F c', $cx + $k, $y - $r, $cx + $r, $y - $k, $cx + $r, $y);
        $this->_out($op);
        $this->_out('f');
    }

    /** Courbe de bézier (coup du flamant) — coordonnées « haut-gauche » comme pdfkit. */
    public function bezierStroke(float $x0, float $y0, float $c1x, float $c1y, float $c2x, float $c2y, float $x3, float $y3, float $lw, string $color): void
    {
        [$r, $g, $b] = $this->rgb($color);
        $this->SetDrawColor($r, $g, $b);
        $this->SetLineWidth($lw);
        $this->_out('1 J'); // extrémités arrondies
        $this->_out(sprintf(
            '%.2F %.2F m %.2F %.2F %.2F %.2F %.2F %.2F c S',
            $x0, $this->yf($y0), $c1x, $this->yf($c1y), $c2x, $this->yf($c2y), $x3, $this->yf($y3)
        ));
        $this->_out('0 J');
    }

    public function lineSeg(float $x1, float $y1, float $x2, float $y2, float $lw, string $color): void
    {
        [$r, $g, $b] = $this->rgb($color);
        $this->SetDrawColor($r, $g, $b);
        $this->SetLineWidth($lw);
        $this->Line($x1, $y1, $x2, $y2);
    }

    public function rectBox(float $x, float $y, float $w, float $h, string $color): void
    {
        [$r, $g, $b] = $this->rgb($color);
        $this->SetFillColor($r, $g, $b);
        $this->Rect($x, $y, $w, $h, 'F');
    }

    /* ——— composition (mêmes cotes que lib/pdf.ts) ——— */

    public function drawLogo(float $x, float $y, float $size = 34): void
    {
        $this->roundRectFill($x, $y, $size, $size, $size * 0.28, '#F04438');
        $this->bezierStroke(
            $x + $size * 0.32, $y + $size * 0.78,
            $x + $size * 0.30, $y + $size * 0.42,
            $x + $size * 0.62, $y + $size * 0.50,
            $x + $size * 0.62, $y + $size * 0.30,
            $size * 0.075, '#FFFFFF'
        );
        $this->circleFill($x + $size * 0.62, $y + $size * 0.27, $size * 0.085, '#FFFFFF');
    }

    public function docHeader(array $s, string $title, string $ref, string $subtitle): void
    {
        $W = $this->w;
        $this->rectBox(0, 0, $W, 96, '#0B0C0E');
        $this->drawLogo(40, 30, 36);
        $this->txt(88, 38, 17, 'B', '#FFFFFF', (string)($s['brand'] ?? 'FLAMINGO AUTO'), 1.4);
        $this->txt(88, 60, 9, 'B', '#F04438', (string)($s['city'] ?? 'KÉNITRA'), 4);
        $this->txt(88, 74, 8, '', '#939CAB', ($s['phone'] ?? '') . '  •  ' . ($s['instagramHandle'] ?? ''));
        $this->txtR($W - 40, 36, 20, 'B', '#FFFFFF', $title);
        $this->txtR($W - 40, 60, 10, 'B', '#F04438', $ref);
        if ($subtitle !== '') {
            $this->txtR($W - 40, 74, 8, '', '#939CAB', $subtitle);
        }
        $this->rectBox(0, 96, $W, 3, '#F04438');
    }

    public function partyBox(float $x, float $y, float $w, string $label, array $lines): void
    {
        $this->roundRectFill($x, $y, $w, 74, 6, '#EEF0F4');
        $this->txt($x + 12, $y + 10, 7.5, 'B', '#6E7787', strtoupper($label), 1.6);
        $this->txt($x + 12, $y + 24, 10.5, 'B', '#0B0C0E', (string)($lines[0] ?? '—'));
        $rest = array_values(array_filter(array_slice($lines, 1), fn($l) => $l !== '' && $l !== null));
        $cy = $y + 40;
        foreach ($rest as $l) {
            $this->txt($x + 12, $cy, 8.5, '', '#333A46', (string)$l);
            $cy += 10.6;
        }
    }

    public function itemsTable(array $items, float $y): float
    {
        $W = $this->w;
        $left = 40.0;
        $right = $W - 40;
        $this->roundRectFill($left, $y, $right - $left, 24, 4, '#0B0C0E');
        $qtyEnd = $right - 160;
        $unitEnd = $right - 90;
        $priceEnd = $right - 10;
        $totalEnd = $right - 8;
        $labelX = $left + 8;
        $this->txt($labelX, $y + 8, 8, 'B', '#FFFFFF', 'DÉSIGNATION');
        $this->txtR($qtyEnd, $y + 8, 8, 'B', '#FFFFFF', 'QTÉ');
        $this->txtR($unitEnd, $y + 8, 8, 'B', '#FFFFFF', 'UNITÉ');
        $this->txtR($priceEnd, $y + 8, 8, 'B', '#FFFFFF', 'P.U. HT');
        $this->txtR($totalEnd, $y + 8, 8, 'B', '#FFFFFF', 'TOTAL HT');
        $cy = $y + 24;
        $labelMax = ($right - 210) - $labelX - 16;
        $i = 0;
        foreach ($items as $it) {
            if ($i % 2 === 0) {
                $this->rectBox($left, $cy, $right - $left, 26, '#F7F8FA');
            }
            $this->font('', 9);
            $label = $this->trunc((string)($it['label'] ?? ''), $labelMax);
            $this->txt($labelX, $cy + 8, 9, '', '#0B0C0E', $label);
            $this->txtR($qtyEnd, $cy + 8, 9, '', '#0B0C0E', (string)($it['qty'] ?? 0));
            $this->txtR($unitEnd, $cy + 8, 9, '', '#0B0C0E', (string)($it['unit'] ?? ''));
            $this->txtR($priceEnd, $cy + 8, 9, '', '#0B0C0E', money_fmt((float)($it['price'] ?? 0), true));
            $this->txtR($totalEnd, $cy + 8, 9, 'B', '#0B0C0E', money_fmt((float)($it['qty'] ?? 0) * (float)($it['price'] ?? 0), true));
            $cy += 26;
            $i++;
        }
        return $cy;
    }

    public function totalsBlock(array $items, float $discount, float $tva, float $y): float
    {
        $W = $this->w;
        $t = line_totals($items, $discount, $tva);
        $boxW = 220.0;
        $x = $W - 40 - $boxW;
        $cy = $y + 14;
        $row = function (string $label, string $value, bool $bold = false, string $color = '#0B0C0E') use (&$cy, $x, $boxW) {
            $size = $bold ? 11 : 9;
            $this->txt($x, $cy, $size, $bold ? 'B' : '', $color, $label);
            $this->txtR($x + $boxW, $cy, $size, $bold ? 'B' : '', $color, $value);
            $cy += $bold ? 20 : 15;
        };
        $row('Total HT', money_fmt($t['ht'], true));
        if ($t['discount'] > 0) {
            $row('Remise', '- ' . money_fmt($t['discount'], true), false, '#BC0500');
        }
        $row('TVA ' . rtrim(rtrim(number_format($tva, 2, ',', ' '), '0'), ',') . '%', money_fmt($t['tvaAmount'], true));
        $this->lineSeg($x, $cy - 4, $x + $boxW, $cy - 4, 1, '#DFE3EA');
        $cy += 4;
        $this->roundRectFill($x, $cy, $boxW, 26, 4, '#F04438');
        $this->txt($x + 10, $cy + 7, 11, 'B', '#FFFFFF', 'TOTAL TTC');
        $this->txtR($x + $boxW - 10, $cy + 7, 11, 'B', '#FFFFFF', money_fmt($t['ttc'], true));
        return $cy + 26;
    }

    public function docFooter(array $s): void
    {
        $H = $this->h;
        $W = $this->w;
        $this->rectBox(0, $H - 46, $W, 46, '#0B0C0E');
        $this->txt(40, $H - 34, 7.5, '', '#939CAB', (string)($s['legal'] ?? 'FLAMINGO AUTO KÉNITRA'));
        $this->txt(40, $H - 22, 7.5, '', '#939CAB', ($s['phone'] ?? '') . '  •  ' . ($s['instagramHandle'] ?? ''));
        $this->txtR($W - 40, $H - 28, 7.5, 'B', '#F04438', (string)($s['sloganFr'] ?? ''));
    }
}

/* ——— documents ——— */

function invoice_pdf(array $inv, array $s, ?array $client, ?array $vehicle, array $payments): string
{
    $pdf = new FlamingoPDF();
    $W = 595.28;
    $pdf->docHeader($s, 'FACTURE', (string)($inv['ref'] ?? ''), 'Émise le ' . fr_date($inv['issuedAt'] ?? null));
    $pdf->partyBox(40, 122, ($W - 100) / 2, 'Client', [
        $client['nom'] ?? 'Client',
        $client['ville'] ?? '',
        $client['telephone'] ?? '',
    ]);
    $pdf->partyBox(60 + ($W - 100) / 2, 122, ($W - 100) / 2, 'Véhicule', $vehicle ? [
        ($vehicle['marque'] ?? '') . ' ' . ($vehicle['modele'] ?? ''),
        'Immatriculation : ' . ($vehicle['immatriculation'] ?? ''),
        'Année : ' . ($vehicle['annee'] ?? ''),
    ] : ['—']);
    $pdf->txt(40, 210, 8, 'B', '#6E7787', 'ÉCHÉANCE', 1.4);
    $pdf->txt(40, 222, 10, '', '#0B0C0E', !empty($inv['dueAt']) ? fr_date($inv['dueAt']) : 'À réception');
    $y = $pdf->itemsTable($inv['items'] ?? [], 248);
    $y = $pdf->totalsBlock($inv['items'] ?? [], (float)($inv['discount'] ?? 0), (float)($inv['tva'] ?? 20), $y);
    $paid = 0.0;
    foreach ($payments as $p) {
        $paid += (float)($p['amount'] ?? 0);
    }
    if ($paid > 0) {
        $t = line_totals($inv['items'] ?? [], (float)($inv['discount'] ?? 0), (float)($inv['tva'] ?? 20));
        $y += 12;
        $pdf->txtR($W - 40, $y, 9.5, 'B', '#22C55E', 'Déjà réglé : ' . money_fmt($paid, true));
        $rest = max(0, $t['ttc'] - $paid);
        $pdf->txtR($W - 40, $y + 14, 9.5, 'B', $paid >= $t['ttc'] ? '#22C55E' : '#BC0500', 'Reste dû : ' . money_fmt($rest, true));
    }
    $pdf->txt(40, 640, 8, '', '#6E7787', 'Paiement par espèces, carte, chèque ou virement.');
    $pdf->txt(40, 652, 8, '', '#6E7787', (string)($s['sloganFr'] ?? ''));
    $pdf->docFooter($s);
    return (string)$pdf->Output('S');
}

function quote_pdf(array $q, array $s, ?array $client, ?array $vehicle): string
{
    $pdf = new FlamingoPDF();
    $W = 595.28;
    $pdf->docHeader(
        $s,
        'DEVIS',
        (string)($q['ref'] ?? ''),
        !empty($q['validUntil']) ? "Valable jusqu'au " . fr_date($q['validUntil']) : ''
    );
    $pdf->partyBox(40, 122, ($W - 100) / 2, 'Client', [
        $client['nom'] ?? ($q['customerName'] ?? 'Client'),
        $client['ville'] ?? '',
        $client['telephone'] ?? ($q['customerPhone'] ?? ''),
    ]);
    $pdf->partyBox(60 + ($W - 100) / 2, 122, ($W - 100) / 2, 'Véhicule', $vehicle ? [
        ($vehicle['marque'] ?? '') . ' ' . ($vehicle['modele'] ?? ''),
        'Immatriculation : ' . ($vehicle['immatriculation'] ?? ''),
    ] : ['—']);
    $y = $pdf->itemsTable($q['items'] ?? [], 248);
    $pdf->totalsBlock($q['items'] ?? [], (float)($q['discount'] ?? 0), (float)($q['tva'] ?? 20), $y);
    $pdf->txt(40, 620, 8, '', '#6E7787', (string)($q['notes'] ?? '') !== '' ? (string)$q['notes'] : 'Devis gratuit et sans engagement.');
    $pdf->docFooter($s);
    return (string)$pdf->Output('S');
}
