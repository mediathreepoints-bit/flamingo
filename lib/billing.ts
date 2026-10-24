import { Invoice, Payment, InvoiceStatus } from './types';
import { lineTotals, todayISO } from './format';

export const invoicePaid = (payments: Payment[], invoiceId: string) =>
  payments.filter((p) => p.invoiceId === invoiceId).reduce((s, p) => s + p.amount, 0);

export const invoiceDue = (inv: Invoice) => lineTotals(inv.items, inv.discount, inv.tva).ttc;

export const invoiceBalance = (payments: Payment[], inv: Invoice) =>
  Math.max(0, invoiceDue(inv) - invoicePaid(payments, inv.id));

export function computeInvoiceStatus(payments: Payment[], inv: Invoice): InvoiceStatus {
  const paid = invoicePaid(payments, inv.id);
  const due = invoiceDue(inv);
  if (due > 0 && paid >= due) return 'payee';
  if (paid > 0) return inv.dueAt && inv.dueAt < todayISO() ? 'en_retard' : 'partielle';
  if (inv.dueAt && inv.dueAt < todayISO()) return 'en_retard';
  return 'emise';
}
