'use client';

import { useLiveRows } from './live';

import { useState } from 'react';
import { PageHeader, DataTable, Modal, TextInput, SelectInput, StatusChip, AddButton, useToast, type Column } from './ui';
import { api } from './client-api';
import { EXPENSE_CATEGORY_META, PAYMENT_METHOD_META, type Expense, type ExpenseCategory, type PaymentMethod } from '@/lib/types';
import { fmtDate, fmtMoney, todayISO } from '@/lib/format';

const CATEGORIES = Object.keys(EXPENSE_CATEGORY_META) as ExpenseCategory[];
const METHODS = Object.keys(PAYMENT_METHOD_META) as PaymentMethod[];

const emptyForm = { date: todayISO(), category: 'pieces', label: '', supplier: '', amount: '', method: 'especes', notes: '' };

/** Gestion des dépenses de la société : saisie, liste, suppression. */
export default function ExpensesManager({ initial }: { initial: Expense[] }) {
  const toast = useToast();
  const [rows, setRows] = useLiveRows('expenses', initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const month = todayISO().slice(0, 7);
  const totalMonth = rows.filter((r) => r.date.startsWith(month)).reduce((s, r) => s + r.amount, 0);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !(Number(form.amount) > 0)) {
      toast('Libellé et montant valide requis', 'err');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...form, amount: Number(form.amount), supplier: form.supplier || undefined, notes: form.notes || undefined };
      const { record } = await api<{ record: Expense }>('expenses', 'POST', undefined, payload);
      setRows((r) => [record, ...r]);
      toast('Dépense enregistrée');
      setOpen(false);
      setForm(emptyForm);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (x: Expense) => {
    if (!confirm('Supprimer cette dépense ?')) return;
    try {
      await api('expenses', 'DELETE', x.id);
      setRows((r) => r.filter((y) => y.id !== x.id));
      toast('Dépense supprimée');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<Expense>[] = [
    { key: 'date', header: 'Date', render: (x) => fmtDate(x.date) },
    {
      key: 'category',
      header: 'Catégorie',
      render: (x) => {
        const m = EXPENSE_CATEGORY_META[x.category] || EXPENSE_CATEGORY_META.autre;
        return <StatusChip label={m.label} color={m.color} />;
      },
    },
    { key: 'label', header: 'Libellé', render: (x) => <span className="font-bold text-white">{x.label}</span> },
    { key: 'supplier', header: 'Fournisseur', render: (x) => x.supplier || '—' },
    { key: 'method', header: 'Règlement', render: (x) => PAYMENT_METHOD_META[x.method] || x.method },
    { key: 'amount', header: 'Montant', render: (x) => <span className="font-mono font-bold text-flame-400">{fmtMoney(x.amount)}</span> },
    {
      key: 'actions',
      header: '',
      render: (x) => (
        <button onClick={() => remove(x)} className="rounded-lg border border-ink-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-mega text-steel-400 transition hover:border-danger/50 hover:text-danger">
          Supprimer
        </button>
      ),
    },
  ];

  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader
        title="Dépenses"
        subtitle={`Total ${fmtMoney(total)} · ce mois ${fmtMoney(totalMonth)}`}
        action={<AddButton label="Nouvelle dépense" onClick={() => setOpen(true)} />}
      />

      <DataTable rows={sorted} columns={columns} empty="Aucune dépense enregistrée. Ajoutez les achats de pièces, fournitures, loyer, salaires…" />

      <Modal open={open} title="Nouvelle dépense" onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Date" type="date" value={form.date} onChange={set('date')} required />
              <SelectInput label="Catégorie" value={form.category} onChange={set('category')} options={CATEGORIES.map((c) => ({ value: c, label: EXPENSE_CATEGORY_META[c].label }))} />
            </div>
            <TextInput label="Libellé" value={form.label} onChange={set('label')} placeholder="Ex : kit aile + peinture" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Fournisseur (optionnel)" value={form.supplier} onChange={set('supplier')} placeholder="Ex : Auto Parts Kénitra" />
              <TextInput label="Montant (MAD)" type="number" step="0.01" value={form.amount} onChange={set('amount')} required />
            </div>
            <SelectInput label="Règlement" value={form.method} onChange={set('method')} options={METHODS.map((m) => ({ value: m, label: PAYMENT_METHOD_META[m] || m }))} />
            <TextInput label="Notes (optionnel)" value={form.notes} onChange={set('notes')} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Annuler</button>
              <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </form>
      </Modal>
    </div>
  );
}
