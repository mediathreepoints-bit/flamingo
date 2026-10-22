import { repo, type Entity } from './repo';
import { uid, todayISO } from './format';
import { computeInvoiceStatus } from './billing';
import type { Invoice, Payment, Quote, Repair, RepairStatus } from './types';

const now = () => new Date().toISOString();
type Rec = Record<string, any> & { id: string };

async function nextRef(entity: Entity, prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const rows = (await repo.list<Rec>(entity)) || [];
  const max = rows.reduce((m, r) => {
    const match = String(r.ref || '').match(new RegExp(`^${prefix}-${year}-(\\d+)$`));
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `${prefix}-${year}-${String(max + 1).padStart(4, '0')}`;
}

/** Création avec valeurs par défaut métier. */
export async function apiCreate(entity: Entity, body: Record<string, unknown>): Promise<Rec> {
  const base: Rec = { ...body } as Rec;
  base.id = base.id || uid(entity.slice(0, 2));
  switch (entity) {
    case 'customers':
      base.createdAt = base.createdAt || now();
      break;
    case 'repairs': {
      const status = (base.status as RepairStatus) || 'diagnostic';
      base.ref = base.ref || (await nextRef('repairs', 'REP'));
      base.status = status;
      base.priority = base.priority || 'normale';
      base.createdAt = base.createdAt || now();
      base.history = [{ at: now(), status }];
      break;
    }
    case 'quotes':
      base.ref = base.ref || (await nextRef('quotes', 'DV'));
      base.items = base.items || [];
      base.discount = base.discount ?? 0;
      base.tva = base.tva ?? 20;
      base.status = base.status || 'brouillon';
      base.source = base.source || 'atelier';
      base.createdAt = base.createdAt || now();
      break;
    case 'invoices':
      base.ref = base.ref || (await nextRef('invoices', 'FA'));
      base.items = base.items || [];
      base.discount = base.discount ?? 0;
      base.tva = base.tva ?? 20;
      base.status = base.status || 'emise';
      base.issuedAt = base.issuedAt || now();
      break;
    case 'payments':
      base.date = base.date || todayISO();
      base.method = base.method || 'especes';
      base.type = base.type || 'paiement';
      break;
    case 'appointments':
      base.status = base.status || 'confirme';
      break;
    case 'gallery':
      base.year = base.year || new Date().getFullYear();
      break;
    case 'quoteRequests':
      base.createdAt = base.createdAt || now();
      base.status = base.status || 'nouveau';
      base.photos = base.photos || [];
      break;
    case 'messages':
      base.createdAt = base.createdAt || now();
      base.status = base.status || 'nouveau';
      break;
  }
  const rec = await repo.create(entity, base);
  if (entity === 'payments' || entity === 'invoices') await refreshInvoices();
  return rec;
}

/** Recalcule les statuts de facture après mouvement de paiement. */
export async function refreshInvoices() {
  const [invoices, payments] = await Promise.all([repo.list<Invoice>('invoices'), repo.list<Payment>('payments')]);
  await Promise.all(
    invoices.map((inv) => {
      const status = computeInvoiceStatus(payments, inv);
      if (status !== inv.status) return repo.update('invoices', inv.id, { status });
      return Promise.resolve();
    }),
  );
}

export async function apiPatch(entity: Entity, id: string, body: Record<string, unknown>): Promise<Rec | null> {
  if (entity === 'repairs' && body.status) {
    const current = await repo.get<Repair>('repairs', id);
    if (current && current.status !== body.status) {
      const history = [...(current.history || []), { at: now(), status: body.status as RepairStatus, note: body.note as string | undefined }];
      body = { ...body, history, deliveredDate: body.status === 'livre' ? todayISO() : current.deliveredDate };
    }
  }
  const rec = await repo.update(entity, id, body);
  if (entity === 'payments' || entity === 'invoices') await refreshInvoices();
  return rec;
}

export async function apiDelete(entity: Entity, id: string) {
  const ok = await repo.remove(entity, id);
  if (entity === 'payments') await refreshInvoices();
  return ok;
}

/** Devis accepté → facture. */
export async function convertQuote(quoteId: string) {
  const quote = await repo.get<Quote>('quotes', quoteId);
  if (!quote) return null;
  const invoice = await apiCreate('invoices', {
    customerId: quote.customerId,
    vehicleId: quote.vehicleId,
    quoteId: quote.id,
    items: quote.items,
    discount: quote.discount,
    tva: quote.tva,
    notes: `Issue du devis ${quote.ref}`,
  });
  await repo.update('quotes', quoteId, { status: 'facture' });
  return invoice;
}
