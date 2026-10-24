'use client';

import { useLiveRows, useLiveRelated } from './live';

import { useState } from 'react';
import { PageHeader, DataTable, Modal, TextInput, TextArea, AddButton, useToast, type Column } from './ui';
import { api } from './client-api';
import type { Customer, Vehicle } from '@/lib/types';
import { fmtDate, initials } from '@/lib/format';

const emptyForm = { nom: '', telephone: '', email: '', ville: '', adresse: '', notes: '' };

export default function CustomersManager({ initial, vehicles: vehiclesIn }: { initial: Customer[]; vehicles: Vehicle[] }) {
  const toast = useToast();
  const [rows, setRows] = useLiveRows('customers', initial);
  const vehicles = useLiveRelated('vehicles', vehiclesIn);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (c: Customer) => {
    setEditing(c);
    setForm({ nom: c.nom, telephone: c.telephone, email: c.email || '', ville: c.ville || '', adresse: c.adresse || '', notes: c.notes || '' });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nom.trim().length < 2 || form.telephone.trim().length < 6) {
      toast('Nom et téléphone valides sont requis', 'err');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        const { record } = await api<{ record: Customer }>('customers', 'PATCH', editing.id, form);
        setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
        toast('Client mis à jour');
      } else {
        const { record } = await api<{ record: Customer }>('customers', 'POST', undefined, form);
        setRows((r) => [record, ...r]);
        toast('Client créé');
      }
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: Customer) => {
    if (!confirm(`Supprimer le client « ${c.nom} » ?`)) return;
    try {
      await api('customers', 'DELETE', c.id);
      setRows((r) => r.filter((x) => x.id !== c.id));
      toast('Client supprimé');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'nom', header: 'Client',
      render: (c) => (
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-flame-500/15 text-xs font-black text-flame-400">{initials(c.nom)}</span>
          <span>
            <span className="block font-bold text-white">{c.nom}</span>
            <span className="block text-xs text-steel-500">{vehicles.filter((v) => v.customerId === c.id).length} véhicule(s)</span>
          </span>
        </span>
      ),
    },
    { key: 'telephone', header: 'Téléphone', render: (c) => <a className="font-mono text-flame-400 hover:underline" href={`tel:${c.telephone}`}>{c.telephone}</a> },
    { key: 'email', header: 'Email', render: (c) => c.email || '—' },
    { key: 'ville', header: 'Ville', render: (c) => c.ville || '—' },
    { key: 'createdAt', header: 'Depuis', render: (c) => fmtDate(c.createdAt) },
  ];

  return (
    <div>
      <PageHeader title="Clients" subtitle="Fiche client et coordonnées — jamais exposées sur le site public." action={<AddButton onClick={startNew} label="Nouveau client" />} />
      <DataTable rows={rows} columns={columns} onEdit={startEdit} onDelete={remove} empty="Aucun client. Ajoutez le premier." />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifier le client' : 'Nouveau client'}>
        <form onSubmit={save} className="space-y-4">
          <TextInput label="Nom complet" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Téléphone" value={form.telephone} onChange={(v) => setForm({ ...form, telephone: v })} placeholder="06 XX XX XX XX" required />
            <TextInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Ville" value={form.ville} onChange={(v) => setForm({ ...form, ville: v })} />
            <TextInput label="Adresse" value={form.adresse} onChange={(v) => setForm({ ...form, adresse: v })} />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </Modal>
    </div>
  );
}
