'use client';

import { useState } from 'react';
import { PageHeader, DataTable, Modal, TextInput, SelectInput, TextArea, AddButton, useToast, type Column } from './ui';
import { api } from './client-api';
import type { Customer, Vehicle } from '@/lib/types';

const emptyForm = { customerId: '', marque: '', modele: '', annee: '', immatriculation: '', couleur: '', kilometrage: '', notes: '' };

export default function VehiclesManager({ initial, customers }: { initial: Vehicle[]; customers: Customer[] }) {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({ customerId: v.customerId, marque: v.marque, modele: v.modele, annee: String(v.annee || ''), immatriculation: v.immatriculation, couleur: v.couleur || '', kilometrage: v.kilometrage ? String(v.kilometrage) : '', notes: v.notes || '' });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.marque.trim() || !form.immatriculation.trim()) {
      toast('Client, marque et immatriculation sont requis', 'err');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...form, annee: Number(form.annee) || new Date().getFullYear(), kilometrage: form.kilometrage ? Number(form.kilometrage) : undefined };
      if (editing) {
        const { record } = await api<{ record: Vehicle }>('vehicles', 'PATCH', editing.id, payload);
        setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
        toast('Véhicule mis à jour');
      } else {
        const { record } = await api<{ record: Vehicle }>('vehicles', 'POST', undefined, payload);
        setRows((r) => [record, ...r]);
        toast('Véhicule ajouté');
      }
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (v: Vehicle) => {
    if (!confirm(`Supprimer ${v.marque} ${v.modele} (${v.immatriculation}) ?`)) return;
    try {
      await api('vehicles', 'DELETE', v.id);
      setRows((r) => r.filter((x) => x.id !== v.id));
      toast('Véhicule supprimé');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<Vehicle>[] = [
    { key: 'vehicule', header: 'Véhicule', render: (v) => <span className="font-bold text-white">{v.marque} {v.modele}</span> },
    { key: 'immatriculation', header: 'Immatriculation', render: (v) => <span className="font-mono text-flame-400">{v.immatriculation}</span> },
    { key: 'customer', header: 'Client', render: (v) => customers.find((c) => c.id === v.customerId)?.nom || '—' },
    { key: 'annee', header: 'Année', render: (v) => String(v.annee || '—') },
    { key: 'couleur', header: 'Couleur', render: (v) => v.couleur || '—' },
  ];

  return (
    <div>
      <PageHeader title="Véhicules" subtitle="Parc client : marques, modèles, immatriculations." action={<AddButton onClick={startNew} label="Nouveau véhicule" />} />
      {customers.length === 0 && (
        <p className="mb-4 rounded-lg border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
          Créez d’abord un client pour pouvoir enregistrer un véhicule.
        </p>
      )}
      <DataTable rows={rows} columns={columns} onEdit={startEdit} onDelete={remove} empty="Aucun véhicule enregistré." />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifier le véhicule' : 'Nouveau véhicule'}>
        <form onSubmit={save} className="space-y-4">
          <SelectInput
            label="Client" required value={form.customerId}
            onChange={(v) => setForm({ ...form, customerId: v })}
            options={[{ value: '', label: '— Sélectionner —' }, ...customers.map((c) => ({ value: c.id, label: c.nom }))]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Marque" value={form.marque} onChange={(v) => setForm({ ...form, marque: v })} placeholder="Ex. Renault" required />
            <TextInput label="Modèle" value={form.modele} onChange={(v) => setForm({ ...form, modele: v })} placeholder="Ex. Clio 4" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Immatriculation" value={form.immatriculation} onChange={(v) => setForm({ ...form, immatriculation: v })} required />
            <TextInput label="Année" type="number" value={form.annee} onChange={(v) => setForm({ ...form, annee: v })} placeholder="2020" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Couleur" value={form.couleur} onChange={(v) => setForm({ ...form, couleur: v })} />
            <TextInput label="Kilométrage" type="number" value={form.kilometrage} onChange={(v) => setForm({ ...form, kilometrage: v })} />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </Modal>
    </div>
  );
}
