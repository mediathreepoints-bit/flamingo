import PDFDocument from 'pdfkit';
import type { Invoice, Payment, Quote, Customer, Vehicle } from './types';
import { fmtMoney, lineTotals } from './format';

const RED = '#F04438';
const INK = '#0B0C0E';
const GREY = '#6E7787';
const LIGHT = '#EEF0F4';

const money = (n: number) => fmtMoney(n, { decimals: true });

/** Emblème flamingo redessiné en courbes vectorielles pour les PDF. */
function drawLogo(doc: PDFKit.PDFDocument, x: number, y: number, size = 34) {
  doc.save();
  doc.roundedRect(x, y, size, size, size * 0.28).fill(RED);
  doc.strokeColor('#FFFFFF').lineWidth(size * 0.075).lineCap('round');
  doc
    .moveTo(x + size * 0.32, y + size * 0.78)
    .bezierCurveTo(x + size * 0.3, y + size * 0.42, x + size * 0.62, y + size * 0.5, x + size * 0.62, y + size * 0.3)
    .stroke();
  doc.circle(x + size * 0.62, y + size * 0.27, size * 0.085).fill('#FFFFFF');
  doc.restore();
}

function header(doc: PDFKit.PDFDocument, s: Record<string, string>, title: string, ref: string, subtitle: string) {
  const W = doc.page.width;
  doc.rect(0, 0, W, 96).fill(INK);
  drawLogo(doc, 40, 30, 36);
  doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(17).text(s.brand || 'FLAMINGO AUTO', 88, 38, { characterSpacing: 1.4 });
  doc.fill('#F04438').font('Helvetica-Bold').fontSize(9).text(s.city || 'KÉNITRA', 88, 60, { characterSpacing: 4 });
  doc.fill('#939CAB').font('Helvetica').fontSize(8).text(`${s.phone || ''}  •  ${s.instagramHandle || ''}`, 88, 74);
  doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(20).text(title, W - 240, 36, { width: 200, align: 'right' });
  doc.fill(RED).font('Helvetica-Bold').fontSize(10).text(ref, W - 240, 60, { width: 200, align: 'right' });
  doc.fill('#939CAB').font('Helvetica').fontSize(8).text(subtitle, W - 240, 74, { width: 200, align: 'right' });
  doc.rect(0, 96, W, 3).fill(RED);
}

function partyBox(doc: PDFKit.PDFDocument, x: number, y: number, w: number, label: string, lines: string[]) {
  doc.roundedRect(x, y, w, 74, 6).fill(LIGHT);
  doc.fill(GREY).font('Helvetica-Bold').fontSize(7.5).text(label.toUpperCase(), x + 12, y + 10, { characterSpacing: 1.6 });
  doc.fill(INK).font('Helvetica-Bold').fontSize(10.5).text(lines[0] || '—', x + 12, y + 24, { width: w - 24 });
  doc.fill('#333A46').font('Helvetica').fontSize(8.5).text(lines.slice(1).filter(Boolean).join('\n'), x + 12, y + 40, { width: w - 24 });
}

function itemsTable(doc: PDFKit.PDFDocument, items: { label: string; qty: number; unit: string; price: number }[], y: number) {
  const W = doc.page.width;
  const left = 40;
  const right = W - 40;
  const cols = { label: left + 8, qty: right - 210, unit: right - 150, price: right - 80, total: right - 8 };
  doc.roundedRect(left, y, right - left, 24, 4).fill(INK);
  doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(8);
  doc.text('DÉSIGNATION', cols.label, y + 8);
  doc.text('QTÉ', cols.qty, y + 8, { width: 50, align: 'right' });
  doc.text('UNITÉ', cols.unit, y + 8, { width: 60, align: 'right' });
  doc.text('P.U. HT', cols.price, y + 8, { width: 70, align: 'right' });
  doc.text('TOTAL HT', cols.total, y + 8, { width: 70, align: 'right' });
  let cy = y + 24;
  items.forEach((it, i) => {
    if (i % 2 === 0) doc.rect(left, cy, right - left, 26).fill('#F7F8FA');
    doc.fill(INK).font('Helvetica').fontSize(9);
    doc.text(it.label, cols.label, cy + 8, { width: cols.qty - cols.label - 16 });
    doc.text(String(it.qty), cols.qty, cy + 8, { width: 50, align: 'right' });
    doc.text(it.unit, cols.unit, cy + 8, { width: 60, align: 'right' });
    doc.text(money(it.price), cols.price, cy + 8, { width: 70, align: 'right' });
    doc.font('Helvetica-Bold').text(money(it.qty * it.price), cols.total, cy + 8, { width: 70, align: 'right' });
    cy += 26;
  });
  return cy;
}

function totalsBlock(doc: PDFKit.PDFDocument, items: { qty: number; price: number }[], discount: number, tva: number, y: number) {
  const W = doc.page.width;
  const t = lineTotals(items, discount, tva);
  const boxW = 220;
  const x = W - 40 - boxW;
  let cy = y + 14;
  const row = (label: string, value: string, bold = false, color = INK) => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 11 : 9).fill(color);
    doc.text(label, x, cy, { width: boxW - 90 });
    doc.text(value, x + boxW - 90, cy, { width: 90, align: 'right' });
    cy += bold ? 20 : 15;
  };
  row('Total HT', money(t.ht));
  if (t.discount > 0) row('Remise', `- ${money(t.discount)}`, false, '#BC0500');
  row(`TVA ${tva}%`, money(t.tvaAmount));
  doc.moveTo(x, cy - 4).lineTo(x + boxW, cy - 4).strokeColor('#DFE3EA').lineWidth(1).stroke();
  cy += 4;
  doc.roundedRect(x, cy, boxW, 26, 4).fill(RED);
  doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(11);
  doc.text('TOTAL TTC', x + 10, cy + 7, { width: boxW - 100 });
  doc.text(money(t.ttc), x + boxW - 100, cy + 7, { width: 90, align: 'right' });
  return cy + 26;
}

function footer(doc: PDFKit.PDFDocument, s: Record<string, string>) {
  const H = doc.page.height;
  const W = doc.page.width;
  doc.rect(0, H - 46, W, 46).fill(INK);
  doc.fill('#939CAB').font('Helvetica').fontSize(7.5);
  doc.text(s.legal || 'FLAMINGO AUTO KÉNITRA', 40, H - 30, { width: W - 260 });
  doc.text(`${s.phone || ''}  •  ${s.instagramHandle || ''}`, 40, H - 18, { width: W - 260 });
  doc.fill('#F04438').font('Helvetica-Bold').fontSize(7.5).text(s.sloganFr || '', W - 260, H - 24, { width: 220, align: 'right' });
}

function baseDoc() {
  return new PDFDocument({ size: 'A4', margin: 40, info: { Title: 'Flamingo Auto Kénitra', Author: 'Flamingo Auto Kénitra' } });
}

function toBuffer(doc: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

export async function invoicePdf(inv: Invoice, s: Record<string, string>, ctx: { client?: Customer | null; vehicle?: Vehicle | null; payments: Payment[] }) {
  const doc = baseDoc();
  const promise = toBuffer(doc);
  header(doc, s, 'FACTURE', inv.ref, `Émise le ${new Date(inv.issuedAt).toLocaleDateString('fr-FR')}`);
  const W = doc.page.width;
  partyBox(doc, 40, 122, (W - 100) / 2, 'Client', [ctx.client?.nom || 'Client', ctx.client?.ville || '', ctx.client?.telephone || '']);
  partyBox(doc, 60 + (W - 100) / 2, 122, (W - 100) / 2, 'Véhicule', [
    ctx.vehicle ? `${ctx.vehicle.marque} ${ctx.vehicle.modele}` : '—',
    ctx.vehicle ? `Immatriculation : ${ctx.vehicle.immatriculation}` : '',
    ctx.vehicle ? `Année : ${ctx.vehicle.annee}` : '',
  ]);
  doc.fill(GREY).font('Helvetica-Bold').fontSize(8).text('ÉCHÉANCE', 40, 210, { characterSpacing: 1.4 });
  doc.fill(INK).font('Helvetica').fontSize(10).text(inv.dueAt ? new Date(inv.dueAt).toLocaleDateString('fr-FR') : 'À réception', 40, 222);
  let y = itemsTable(doc, inv.items, 248);
  y = totalsBlock(doc, inv.items, inv.discount, inv.tva, y);
  const paid = ctx.payments.reduce((sum, p) => sum + p.amount, 0);
  const t = lineTotals(inv.items, inv.discount, inv.tva);
  if (paid > 0) {
    y += 12;
    doc.fill('#22C55E').font('Helvetica-Bold').fontSize(9.5).text(`Déjà réglé : ${money(paid)}`, W - 260, y, { width: 220, align: 'right' });
    doc.fill(paid >= t.ttc ? '#22C55E' : '#BC0500').font('Helvetica-Bold').fontSize(9.5).text(`Reste dû : ${money(Math.max(0, t.ttc - paid))}`, W - 260, y + 14, { width: 220, align: 'right' });
  }
  doc.fill(GREY).font('Helvetica').fontSize(8);
  doc.text(`Paiement par espèces, carte, chèque ou virement.\n${s.sloganFr || ''}`, 40, 640, { width: W - 300 });
  footer(doc, s);
  doc.end();
  return promise;
}

export async function quotePdf(q: Quote, s: Record<string, string>, ctx: { client?: Customer | null; vehicle?: Vehicle | null }) {
  const doc = baseDoc();
  const promise = toBuffer(doc);
  header(doc, s, 'DEVIS', q.ref, q.validUntil ? `Valable jusqu'au ${new Date(q.validUntil).toLocaleDateString('fr-FR')}` : '');
  const W = doc.page.width;
  partyBox(doc, 40, 122, (W - 100) / 2, 'Client', [ctx.client?.nom || q.customerName || 'Client', ctx.client?.ville || '', ctx.client?.telephone || q.customerPhone || '']);
  partyBox(doc, 60 + (W - 100) / 2, 122, (W - 100) / 2, 'Véhicule', [
    ctx.vehicle ? `${ctx.vehicle.marque} ${ctx.vehicle.modele}` : '—',
    ctx.vehicle ? `Immatriculation : ${ctx.vehicle.immatriculation}` : '',
  ]);
  let y = itemsTable(doc, q.items, 248);
  y = totalsBlock(doc, q.items, q.discount, q.tva, y);
  doc.fill(GREY).font('Helvetica').fontSize(8);
  doc.text(q.notes || 'Devis gratuit et sans engagement.', 40, 620, { width: W - 300 });
  footer(doc, s);
  doc.end();
  return promise;
}
