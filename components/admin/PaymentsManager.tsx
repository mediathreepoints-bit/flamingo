'use client';

import { useLiveRows, useLiveRelated } from './live';

import { useState } from 'react';
import { PageHeader, DataTable, Modal, TextInput, SelectInput, StatusChip, AddButton, useToast, type Column } from './ui';
import { api } from './client-api';
import { INVOICE_STATUS_META, PAYMENT_METHOD_META, type Customer, type Invoice, type Payment, type PaymentMethod } from '@/lib/types';
import { invoiceBalance, invoicePaid } from '@/lib/billing';
import { fmtDate, fmtMoney, lineTotals, todayISO } from '@/lib/format';

const emptyForm = { customerId: '', invoiceId: '', amount: '', method: 'especes', type: 'paiement', date: todayISO(), notes: '' };

export default function PaymentsManager({ initial, invoices: invoicesIn, customers: customersIn }: { initial: Payment[]; invoices: Invoice[]; customers: Customer[] }) {
  const toast = useToast();
  const [rows, setRows] = useLiveRows('payments', initial);
  const invoices = useLiveRelated('invoices', invoicesIn);
  const customers = useLiveRelated('customers', customersIn);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const startNew = (invoice?: Invoice) => {
    setForm({ ...emptyForm, customerId: invoice?.customerId || '', invoiceId: invoice?.id || '', amount: invoice ? String(Math.round(invoiceBalance(rows, invoice))) : '' });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !(Number(form.amount) > 0)) { toast('Client et montant valide requis', 'err'); return; }
    setBusy(true);
    try {
      const payload = { ...form, amount: Number(form.amount), invoiceId: form.invoiceId || undefined };
      const { record } = await api<{ record: Payment }>('payments', 'POST', undefined, payload);
      setRows((r) => [record, ...r]);
      toast('Paiement enregistré');
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Payment) => {
    if (!confirm('Supprimer ce paiement ?')) return;
    try {
      await api('payments', 'DELETE', p.id);
      setRows((r) => r.filter((x) => x.id !== p.id));
      toast('Paiement supprimé');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<Payment>[] = [
    { key: 'date', header: 'Date', render: (p) => fmtDate(p.date) },
    { key: 'customer', header: 'Client', render: (p) => <span className="font-bold text-white">{customers.find((c) => c.id === p.customerId)?.nom || '—'}</span> },
    { key: 'invoice', header: 'Facture', render: (p) => (p.invoiceId ? <span className="font-mono text-xs text-flame-400">{invoices.find((i) => i.id === p.invoiceId)?.ref || '—'}</span> : '—') },
    { key: 'amount', header: 'Montant', render: (p) => <span className="font-bold text-ok">{fmtMoney(p.amount, { decimals: true })}</span> },
    { key: 'method', header: 'Moyen', render: (p) => PAYMENT_METHOD_META[p.method as PaymentMethod] || p.method },
    { key: 'type', header: 'Type', render: (p) => <span className="capitalize">{p.type}</span> },
  ];

  // soldes par facture
  const balances = invoices
    .map((inv) => ({ inv, paid: invoicePaid(rows, inv.id), due: lineTotals(inv.items || [], inv.discount, inv.tva).ttc, rest: invoiceBalance(rows, inv) }))
    .sort((a, b) => b.rest - a.rest);

  return (
    <div>
      <PageHeader title="Paiements & Soldes" subtitle="Encaissements et reste dû par facture." action={<AddButton onClick={() => startNew()} label="Nouveau paiement" />} />

      <DataTable rows={rows} columns={columns} onDelete={remove} empty="Aucun paiement enregistré." />

      <h2 className="font-display mt-10 mb-4 text-sm font-black uppercase tracking-mega text-white">Soldes par facture</h2>
      {balances.length === 0 ? (
        <p className="card p-8 text-center text-sm text-steel-500">Aucune facture.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-500 bg-ink-800/80 text-[11px] font-bold uppercase tracking-mega text-steel-500">
                <th className="px-4 py-3">Facture</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Total TTC</th>
                <th className="px-4 py-3">Payé</th>
                <th className="px-4 py-3">Reste dû</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {balances.map(({ inv, paid, due, rest }) => (
                <tr key={inv.id} className="border-b border-ink-600/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-flame-400">{inv.ref}</td>
                  <td className="px-4 py-3 font-bold text-white">{customers.find((c) => c.id === inv.customerId)?.nom || '—'}</td>
                  <td className="px-4 py-3">{fmtMoney(due, { decimals: true })}</td>
                  <td className="px-4 py-3 text-ok">{fmtMoney(paid, { decimals: true })}</td>
                  <td className={`px-4 py-3 font-bold ${rest > 0 ? 'text-danger' : 'text-steel-500'}`}>{fmtMoney(rest, { decimals: true })}</td>
                  <td className="px-4 py-3"><StatusChip {...INVOICE_STATUS_META[inv.status]} /></td>
                  <td className="px-4 py-3 text-right">
                    {rest > 0 && (
                      <button onClick={() => startNew(inv)} className="rounded-lg border border-ink-500 px-3 py-1.5 text-xs font-semibold text-steel-300 transition hover:border-ok/50 hover:text-ok">
                        Encaisser
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau paiement">
        <form onSubmit={save} className="space-y-4">
          <SelectInput
            label="Client" required value={form.customerId}
            onChange={(v) => setForm({ ...form, customerId: v, invoiceId: '' })}
            options={[{ value: '', label: '— Sélectionner —' }, ...customers.map((c) => ({ value: c.id, label: c.nom }))]}
          />
          <SelectInput
            label="Facture liée" value={form.invoiceId}
            onChange={(v) => setForm({ ...form, invoiceId: v })}
            options={[{ value: '', label: '— Aucune —' }, ...invoices.filter((i) => i.customerId === form.customerId).map((i) => ({ value: i.id, label: `${i.ref} (reste ${fmtMoney(invoiceBalance(rows, i))})` }))]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Montant (MAD)" type="number" step="0.01" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} required />
            <TextInput label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput label="Moyen" value={form.method} onChange={(v) => setForm({ ...form, method: v })} options={(Object.keys(PAYMENT_METHOD_META) as PaymentMethod[]).map((m) => ({ value: m, label: PAYMENT_METHOD_META[m] }))} />
            <SelectInput label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={[{ value: 'acompte', label: 'Acompte' }, { value: 'solde', label: 'Solde' }, { value: 'paiement', label: 'Paiement' }]} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </Modal>
    </div>
  );
}
