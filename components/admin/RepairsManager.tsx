'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader, DataTable, Modal, TextInput, SelectInput, TextArea, StatusChip, AddButton, useToast, type Column } from './ui';
import { api } from './client-api';
import { REPAIR_FLOW, REPAIR_STATUS_META, CATEGORIES, type Customer, type Repair, type Vehicle } from '@/lib/types';
import { fmtDate, fmtMoney, todayISO } from '@/lib/format';

const emptyForm = { customerId: '', vehicleId: '', status: 'diagnostic', category: 'carrosserie', priority: 'normale', description: '', estimatedAmount: '', startDate: todayISO(), dueDate: '' };

export default function RepairsManager({ initial, customers, vehicles }: { initial: Repair[]; customers: Customer[]; vehicles: Vehicle[] }) {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState('tous');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Repair | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (r: Repair) => {
    setEditing(r);
    setForm({ customerId: r.customerId, vehicleId: r.vehicleId, status: r.status, category: r.category, priority: r.priority, description: r.description, estimatedAmount: r.estimatedAmount ? String(r.estimatedAmount) : '', startDate: r.startDate || '', dueDate: r.dueDate || '' });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.vehicleId || form.description.trim().length < 3) {
      toast('Client, véhicule et description sont requis', 'err');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...form, estimatedAmount: form.estimatedAmount ? Number(form.estimatedAmount) : undefined };
      if (editing) {
        const { record } = await api<{ record: Repair }>('repairs', 'PATCH', editing.id, payload);
        setRows((prev) => prev.map((x) => (x.id === record.id ? record : x)));
        toast('Réparation mise à jour');
      } else {
        const { record } = await api<{ record: Repair }>('repairs', 'POST', undefined, payload);
        setRows((prev) => [record, ...prev]);
        toast(`Réparation ${record.ref} créée`);
      }
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r: Repair) => {
    if (!confirm(`Supprimer la réparation ${r.ref} ?`)) return;
    try {
      await api('repairs', 'DELETE', r.id);
      setRows((prev) => prev.filter((x) => x.id !== r.id));
      toast('Réparation supprimée');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const visible = rows.filter((r) => filter === 'tous' || (filter === 'en_cours' ? r.status !== 'livre' : r.status === filter));

  const columns: Column<Repair>[] = [
    { key: 'ref', header: 'Réf.', render: (r) => <Link href={`/admin/repairs/${r.id}`} className="font-mono text-xs font-bold text-flame-400 hover:underline">{r.ref}</Link> },
    { key: 'customer', header: 'Client', render: (r) => <span className="font-bold text-white">{customers.find((c) => c.id === r.customerId)?.nom || '—'}</span> },
    { key: 'vehicle', header: 'Véhicule', render: (r) => { const v = vehicles.find((x) => x.id === r.vehicleId); return v ? `${v.marque} ${v.modele}` : '—'; } },
    { key: 'category', header: 'Catégorie', render: (r) => CATEGORIES.find((c) => c.id === r.category)?.label || r.category },
    { key: 'status', header: 'Statut', render: (r) => <StatusChip {...REPAIR_STATUS_META[r.status]} /> },
    { key: 'dueDate', header: 'Échéance', render: (r) => fmtDate(r.dueDate) },
    { key: 'amount', header: 'Estimation', render: (r) => (r.estimatedAmount ? fmtMoney(r.estimatedAmount) : '—') },
  ];

  return (
    <div>
      <PageHeader title="Réparations" subtitle="Chantiers de l’atelier, du diagnostic à la livraison." action={<AddButton onClick={startNew} label="Nouvelle réparation" />} />

      <div className="mb-4 flex flex-wrap gap-2">
        {['tous', 'en_cours', ...REPAIR_FLOW].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-mega transition ${filter === f ? 'border-flame-500 bg-flame-500 text-white' : 'border-ink-500 text-steel-400 hover:text-white'}`}
          >
            {f === 'tous' ? 'Toutes' : f === 'en_cours' ? 'En cours' : REPAIR_STATUS_META[f as keyof typeof REPAIR_STATUS_META]?.label || f}
          </button>
        ))}
      </div>

      <DataTable rows={visible} columns={columns} onEdit={startEdit} onDelete={remove} empty="Aucune réparation." />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Réparation ${editing.ref}` : 'Nouvelle réparation'} wide>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="Client" required value={form.customerId}
              onChange={(v) => { setForm({ ...form, customerId: v, vehicleId: '' }); }}
              options={[{ value: '', label: '— Sélectionner —' }, ...customers.map((c) => ({ value: c.id, label: c.nom }))]}
            />
            <SelectInput
              label="Véhicule" required value={form.vehicleId}
              onChange={(v) => setForm({ ...form, vehicleId: v })}
              options={[{ value: '', label: '— Sélectionner —' }, ...vehicles.filter((v) => v.customerId === form.customerId).map((v) => ({ value: v.id, label: `${v.marque} ${v.modele} (${v.immatriculation})` }))]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput label="Statut" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={REPAIR_FLOW.map((s) => ({ value: s, label: REPAIR_STATUS_META[s].label }))} />
            <SelectInput label="Catégorie" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} />
            <SelectInput label="Priorité" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={[{ value: 'normale', label: 'Normale' }, { value: 'haute', label: 'Haute' }, { value: 'urgente', label: 'Urgente' }]} />
          </div>
          <TextArea label="Description des travaux" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={4} />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput label="Estimation (MAD)" type="number" value={form.estimatedAmount} onChange={(v) => setForm({ ...form, estimatedAmount: v })} />
            <TextInput label="Début" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
            <TextInput label="Échéance" type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </Modal>
    </div>
  );
}
