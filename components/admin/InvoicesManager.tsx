'use client';

import { useLiveRows, useLiveRelated } from './live';
import { apiUrl } from '@/lib/client-env';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { PageHeader, DataTable, Modal, TextInput, SelectInput, TextArea, StatusChip, AddButton, useToast, type Column } from './ui';
import ItemsEditor, { emptyItem } from './ItemsEditor';
import { api } from './client-api';
import { INVOICE_STATUS_META, type Customer, type Invoice, type LineItem, type Payment, type Vehicle } from '@/lib/types';
import { computeInvoiceStatus, invoiceBalance, invoicePaid } from '@/lib/billing';
import { fmtDate, fmtMoney, lineTotals, todayISO } from '@/lib/format';

const emptyForm = { customerId: '', vehicleId: '', discount: '0', tva: '20', issuedAt: todayISO(), dueAt: '', notes: '' };

export default function InvoicesManager({ initial, customers: customersIn, vehicles: vehiclesIn, payments: paymentsIn }: { initial: Invoice[]; customers: Customer[]; vehicles: Vehicle[]; payments: Payment[] }) {
  const toast = useToast();
  const [rows, setRows] = useLiveRows('invoices', initial);
  const customers = useLiveRelated('customers', customersIn);
  const vehicles = useLiveRelated('vehicles', vehiclesIn);
  const payments = useLiveRelated('payments', paymentsIn);
  const [pays, setPays] = useState(payments);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [busy, setBusy] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyForm); setItems([emptyItem()]); setOpen(true); };
  const startEdit = (inv: Invoice) => {
    setEditing(inv);
    setForm({ customerId: inv.customerId, vehicleId: inv.vehicleId || '', discount: String(inv.discount), tva: String(inv.tva), issuedAt: inv.issuedAt?.slice(0, 10) || todayISO(), dueAt: inv.dueAt || '', notes: inv.notes || '' });
    setItems(inv.items?.length ? inv.items : [emptyItem()]);
    setOpen(true);
  };

  const refreshStatuses = (nextPays: Payment[], nextRows?: Invoice[]) => {
    const list = nextRows || rows;
    return list.map((inv) => {
      const status = computeInvoiceStatus(nextPays, inv);
      return status !== inv.status ? { ...inv, status } : inv;
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItems = items.filter((i) => i.label.trim());
    if (!cleanItems.length) { toast('Ajoutez au moins une ligne', 'err'); return; }
    if (!form.customerId) { toast('Sélectionnez un client', 'err'); return; }
    setBusy(true);
    try {
      const payload = { ...form, items: cleanItems, discount: Number(form.discount) || 0, tva: Number(form.tva) || 0, issuedAt: new Date(form.issuedAt).toISOString(), dueAt: form.dueAt || undefined };
      if (editing) {
        const { record } = await api<{ record: Invoice }>('invoices', 'PATCH', editing.id, payload);
        const next = refreshStatuses(pays, rows.map((x) => (x.id === record.id ? record : x)));
        setRows(next);
        toast('Facture mise à jour');
      } else {
        const { record } = await api<{ record: Invoice }>('invoices', 'POST', undefined, payload);
        setRows((r) => [record, ...r]);
        toast(`Facture ${record.ref} créée`);
      }
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (inv: Invoice) => {
    if (!confirm(`Supprimer la facture ${inv.ref} ?`)) return;
    try {
      await api('invoices', 'DELETE', inv.id);
      setRows((r) => r.filter((x) => x.id !== inv.id));
      toast('Facture supprimée');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<Invoice>[] = [
    { key: 'ref', header: 'Réf.', render: (i) => <span className="font-mono text-xs font-bold text-flame-400">{i.ref}</span> },
    { key: 'client', header: 'Client', render: (i) => <span className="font-bold text-white">{customers.find((c) => c.id === i.customerId)?.nom || '—'}</span> },
    { key: 'issuedAt', header: 'Émise', render: (i) => fmtDate(i.issuedAt) },
    { key: 'ttc', header: 'Total TTC', render: (i) => fmtMoney(lineTotals(i.items || [], i.discount, i.tva).ttc, { decimals: true }) },
    { key: 'paid', header: 'Payé', render: (i) => <span className="text-ok">{fmtMoney(invoicePaid(pays, i.id), { decimals: true })}</span> },
    { key: 'balance', header: 'Reste dû', render: (i) => { const b = invoiceBalance(pays, i); return <span className={b > 0 ? 'text-danger' : 'text-steel-500'}>{fmtMoney(b, { decimals: true })}</span>; } },
    { key: 'status', header: 'Statut', render: (i) => <StatusChip {...INVOICE_STATUS_META[i.status]} /> },
    {
      key: 'pdf', header: 'PDF',
      render: (i) => (
        <a href={apiUrl(`/api/pdf/invoice/${i.id}`)} target="_blank" rel="noopener noreferrer" title="Ouvrir le PDF" className="inline-block rounded-lg border border-ink-500 p-1.5 text-steel-300 transition hover:border-flame-500/50 hover:text-white">
          <FileText className="h-4 w-4" />
        </a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Factures" subtitle="Facturation, statuts de paiement et exports PDF." action={<AddButton onClick={startNew} label="Nouvelle facture" />} />
      <DataTable rows={rows} columns={columns} onEdit={startEdit} onDelete={remove} empty="Aucune facture." />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Facture ${editing.ref}` : 'Nouvelle facture'} wide>
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Client" required value={form.customerId}
              onChange={(v) => setForm({ ...form, customerId: v })}
              options={[{ value: '', label: '— Sélectionner —' }, ...customers.map((c) => ({ value: c.id, label: c.nom }))]}
            />
            <SelectInput
              label="Véhicule" value={form.vehicleId}
              onChange={(v) => setForm({ ...form, vehicleId: v })}
              options={[{ value: '', label: '— Aucun —' }, ...vehicles.filter((v) => !form.customerId || v.customerId === form.customerId).map((v) => ({ value: v.id, label: `${v.marque} ${v.modele} (${v.immatriculation})` }))]}
            />
          </div>
          <ItemsEditor items={items} onChange={setItems} />
          <div className="grid gap-4 sm:grid-cols-4">
            <TextInput label="Remise (MAD)" type="number" value={form.discount} onChange={(v) => setForm({ ...form, discount: v })} />
            <TextInput label="TVA (%)" type="number" value={form.tva} onChange={(v) => setForm({ ...form, tva: v })} />
            <TextInput label="Émise le" type="date" value={form.issuedAt} onChange={(v) => setForm({ ...form, issuedAt: v })} />
            <TextInput label="Échéance" type="date" value={form.dueAt} onChange={(v) => setForm({ ...form, dueAt: v })} />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </Modal>
    </div>
  );
}
