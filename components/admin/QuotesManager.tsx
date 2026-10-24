'use client';

import { useLiveRows, useLiveRelated } from './live';
import { apiUrl } from '@/lib/client-env';

import { useState } from 'react';
import { FileText, ReceiptText } from 'lucide-react';
import { PageHeader, DataTable, Modal, TextInput, SelectInput, TextArea, StatusChip, AddButton, useToast, type Column } from './ui';
import ItemsEditor, { emptyItem } from './ItemsEditor';
import { api, convertQuoteApi } from './client-api';
import { QUOTE_STATUS_META, type Customer, type LineItem, type Quote, type Vehicle } from '@/lib/types';
import { fmtDate, fmtMoney, lineTotals, todayISO } from '@/lib/format';

const statusOptions = (Object.keys(QUOTE_STATUS_META) as (keyof typeof QUOTE_STATUS_META)[]).map((s) => ({ value: s, label: QUOTE_STATUS_META[s].label }));

const emptyForm = {
  customerId: '', vehicleId: '', customerName: '', customerPhone: '',
  status: 'brouillon', source: 'atelier', discount: '0', tva: '20',
  validUntil: '', notes: '',
};

export default function QuotesManager({ initial, customers: customersIn, vehicles: vehiclesIn }: { initial: Quote[]; customers: Customer[]; vehicles: Vehicle[] }) {
  const toast = useToast();
  const [rows, setRows] = useLiveRows('quotes', initial);
  const customers = useLiveRelated('customers', customersIn);
  const vehicles = useLiveRelated('vehicles', vehiclesIn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [busy, setBusy] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyForm); setItems([emptyItem()]); setOpen(true); };
  const startEdit = (q: Quote) => {
    setEditing(q);
    setForm({ customerId: q.customerId || '', vehicleId: q.vehicleId || '', customerName: q.customerName || '', customerPhone: q.customerPhone || '', status: q.status, source: q.source, discount: String(q.discount), tva: String(q.tva), validUntil: q.validUntil || '', notes: q.notes || '' });
    setItems(q.items?.length ? q.items : [emptyItem()]);
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItems = items.filter((i) => i.label.trim());
    if (!cleanItems.length) { toast('Ajoutez au moins une ligne au devis', 'err'); return; }
    if (!form.customerId && form.customerName.trim().length < 2) { toast('Sélectionnez un client ou saisissez un nom', 'err'); return; }
    setBusy(true);
    try {
      const payload = { ...form, items: cleanItems, discount: Number(form.discount) || 0, tva: Number(form.tva) || 0, validUntil: form.validUntil || undefined };
      if (editing) {
        const { record } = await api<{ record: Quote }>('quotes', 'PATCH', editing.id, payload);
        setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
        toast('Devis mis à jour');
      } else {
        const { record } = await api<{ record: Quote }>('quotes', 'POST', undefined, payload);
        setRows((r) => [record, ...r]);
        toast(`Devis ${record.ref} créé`);
      }
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (q: Quote) => {
    if (!confirm(`Supprimer le devis ${q.ref} ?`)) return;
    try {
      await api('quotes', 'DELETE', q.id);
      setRows((r) => r.filter((x) => x.id !== q.id));
      toast('Devis supprimé');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const convert = async (q: Quote) => {
    if (!confirm(`Convertir le devis ${q.ref} en facture ?`)) return;
    try {
      const { invoice } = await convertQuoteApi(q.id);
      const { record } = await api<{ record: Quote }>('quotes', 'GET', q.id);
      setRows((r) => r.map((x) => (x.id === q.id ? record : x)));
      toast(`Facture ${invoice.ref} créée`);
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const clientLabel = (q: Quote) => customers.find((c) => c.id === q.customerId)?.nom || q.customerName || '—';

  const columns: Column<Quote>[] = [
    { key: 'ref', header: 'Réf.', render: (q) => <span className="font-mono text-xs font-bold text-flame-400">{q.ref}</span> },
    { key: 'client', header: 'Client', render: (q) => <span className="font-bold text-white">{clientLabel(q)}</span> },
    { key: 'date', header: 'Date', render: (q) => fmtDate(q.createdAt) },
    { key: 'total', header: 'Total TTC', render: (q) => <span className="font-bold">{fmtMoney(lineTotals(q.items || [], q.discount, q.tva).ttc, { decimals: true })}</span> },
    { key: 'status', header: 'Statut', render: (q) => <StatusChip {...QUOTE_STATUS_META[q.status]} /> },
    {
      key: 'actions', header: 'PDF / Facture',
      render: (q) => (
        <span className="flex justify-start gap-1.5">
          <a href={apiUrl(`/api/pdf/quote/${q.id}`)} target="_blank" rel="noopener noreferrer" title="Ouvrir le PDF" className="rounded-lg border border-ink-500 p-1.5 text-steel-300 transition hover:border-flame-500/50 hover:text-white">
            <FileText className="h-4 w-4" />
          </a>
          {q.status === 'accepte' && (
            <button onClick={() => convert(q)} title="Convertir en facture" className="rounded-lg border border-ok/40 bg-ok/10 p-1.5 text-ok transition hover:bg-ok/20">
              <ReceiptText className="h-4 w-4" />
            </button>
          )}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Devis" subtitle="Établissez, suivez et convertissez vos devis en factures." action={<AddButton onClick={startNew} label="Nouveau devis" />} />
      <DataTable rows={rows} columns={columns} onEdit={startEdit} onDelete={remove} empty="Aucun devis. Créez le premier." />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Devis ${editing.ref}` : 'Nouveau devis'} wide>
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Client enregistré" value={form.customerId}
              onChange={(v) => setForm({ ...form, customerId: v })}
              options={[{ value: '', label: '— Client occasionnel —' }, ...customers.map((c) => ({ value: c.id, label: c.nom }))]}
            />
            <SelectInput
              label="Véhicule" value={form.vehicleId}
              onChange={(v) => setForm({ ...form, vehicleId: v })}
              options={[{ value: '', label: '— Aucun —' }, ...vehicles.filter((v) => !form.customerId || v.customerId === form.customerId).map((v) => ({ value: v.id, label: `${v.marque} ${v.modele} (${v.immatriculation})` }))]}
            />
          </div>
          {!form.customerId && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Nom du client" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
              <TextInput label="Téléphone" value={form.customerPhone} onChange={(v) => setForm({ ...form, customerPhone: v })} />
            </div>
          )}
          <ItemsEditor items={items} onChange={setItems} />
          <div className="grid gap-4 sm:grid-cols-4">
            <TextInput label="Remise (MAD)" type="number" value={form.discount} onChange={(v) => setForm({ ...form, discount: v })} />
            <TextInput label="TVA (%)" type="number" value={form.tva} onChange={(v) => setForm({ ...form, tva: v })} />
            <SelectInput label="Statut" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
            <TextInput label="Valable jusqu’au" type="date" value={form.validUntil} onChange={(v) => setForm({ ...form, validUntil: v })} />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </Modal>
    </div>
  );
}
