'use client';

import { useLiveRows } from './live';

import { useState } from 'react';
import { PageHeader, DataTable, Modal, TextInput, TextArea, AddButton, StatusChip, useToast, type Column } from './ui';
import { api } from './client-api';
import type { Promotion } from '@/lib/types';
import { SERVICES8_META } from '@/lib/services-meta';

const SERVICE_LABELS: Record<string, string> = {
  carrosserie: 'Carrosserie & Tôlerie',
  peinture: 'Peinture au four',
  polissage: 'Polissage & Lustrage',
  plastiques: 'Réparation plastiques',
  vitrage: 'Vitrage automobile',
  pieces: 'Remplacement de pièces',
  interieur: 'Rénovation intérieure',
  petites: 'Petites réparations',
};

const emptyForm = { title: '', percent: '30', services: [] as string[], start: '', end: '', terms: '', active: false };

export default function PromotionsManager({ initial }: { initial: Promotion[] }) {
  const toast = useToast();
  const [rows, setRows] = useLiveRows('promotions', initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (p: Promotion) => {
    setEditing(p);
    setForm({ title: p.title, percent: String(p.percent || ''), services: [...(p.services || [])], start: p.start || '', end: p.end || '', terms: p.terms || '', active: p.active === true });
    setOpen(true);
  };

  const toggleService = (id: string) =>
    setForm((f) => ({ ...f, services: f.services.includes(id) ? f.services.filter((x) => x !== id) : [...f.services, id] }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !(Number(form.percent) > 0)) {
      toast('Titre et pourcentage sont requis', 'err');
      return;
    }
    if (form.active && (!form.start || !form.end)) {
      toast('Une campagne active doit avoir une date de début et de fin', 'err');
      return;
    }
    setBusy(true);
    try {
      const payload = { title: form.title.trim(), percent: Number(form.percent), services: form.services, start: form.start, end: form.end, terms: form.terms, active: form.active };
      if (editing) {
        const { record } = await api<{ record: Promotion }>('promotions', 'PATCH', editing.id, payload);
        setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
        toast('Campagne mise à jour');
      } else {
        const { record } = await api<{ record: Promotion }>('promotions', 'POST', undefined, payload);
        setRows((r) => [record, ...r]);
        toast('Campagne créée');
      }
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Promotion) => {
    if (!confirm(`Supprimer la campagne « ${p.title} » ?`)) return;
    try {
      await api('promotions', 'DELETE', p.id);
      setRows((r) => r.filter((x) => x.id !== p.id));
      toast('Campagne supprimée');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<Promotion>[] = [
    { key: 'title', header: 'Campagne', render: (p) => <span className="font-bold text-white">{p.title}</span> },
    { key: 'percent', header: 'Remise', render: (p) => <span className="font-mono text-flame-400">-{p.percent}%</span> },
    { key: 'services', header: 'Services', render: (p) => `${(p.services || []).length} service(s)` },
    { key: 'dates', header: 'Période', render: (p) => (p.start || p.end ? <span className="text-xs">{p.start || '…'} → {p.end || '…'}</span> : <span className="text-xs text-steel-500">non planifiée</span>) },
    { key: 'active', header: 'Statut', render: (p) => (p.active ? <StatusChip label="Active sur le site" color="#25D366" /> : <StatusChip label="Inactive" color="#F59E0B" />) },
  ];

  return (
    <div>
      <PageHeader
        title="Promotions & remises"
        subtitle="Aucune remise n'est affichée sur le site tant que la campagne n'est pas active et dans ses dates."
        action={<AddButton onClick={startNew} label="Nouvelle campagne" />}
      />
      <DataTable rows={rows} columns={columns} onEdit={startEdit} onDelete={remove} empty="Aucune campagne enregistrée." />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifier la campagne' : 'Nouvelle campagne'} wide>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Titre" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} required placeholder="Grande réouverture" />
          <TextInput label="Remise (%)" type="number" value={form.percent} onChange={(v) => setForm((f) => ({ ...f, percent: v }))} required step="1" />
          <TextInput label="Début (YYYY-MM-DD)" type="date" value={form.start} onChange={(v) => setForm((f) => ({ ...f, start: v }))} />
          <TextInput label="Fin (YYYY-MM-DD)" type="date" value={form.end} onChange={(v) => setForm((f) => ({ ...f, end: v }))} />
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-steel-400">Services applicables</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SERVICES8_META.map((m) => (
                <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-500 bg-ink-800 px-3 py-2 text-sm text-steel-200 transition hover:border-flame-500/40">
                  <input type="checkbox" checked={form.services.includes(m.id)} onChange={() => toggleService(m.id)} className="accent-[#F04438]" />
                  {SERVICE_LABELS[m.id]}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <TextArea label="Conditions & mentions" value={form.terms} onChange={(v) => setForm((f) => ({ ...f, terms: v }))} rows={3} placeholder="Conditions, exclusions, modalités…" />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink-500 bg-ink-800 px-4 py-3 sm:col-span-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-[#25D366]" />
            <span className="text-sm font-bold text-white">Campagne active (affichée comme offre en cours sur le site)</span>
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-ink-500 px-4 py-2 text-sm text-steel-300 hover:text-white">
              Annuler
            </button>
            <button type="submit" disabled={busy} className="rounded-lg bg-flame-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-flame-600 disabled:opacity-50">
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
