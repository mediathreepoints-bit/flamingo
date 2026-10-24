'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { PageHeader, DataTable, Modal, TextInput, SelectInput, TextArea, StatusChip, AddButton, useToast, type Column } from './ui';
import { api } from './client-api';
import { CATEGORIES, type GalleryItem, type RepairCategory } from '@/lib/types';

const emptyForm = { title: '', vehicle: '', category: 'carrosserie' as RepairCategory | string, description: '', beforeImage: '', afterImage: '', featured: false, year: String(new Date().getFullYear()) };

function ImagePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('photos', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload impossible');
      onChange(json.paths[0]);
      toast('Image envoyée');
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-ink-500 bg-ink-900">
          {value ? <Image src={value} alt={label} fill sizes="128px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-[10px] text-steel-600">Aucune</span>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/… ou /uploads/…" className="field !py-2 font-mono text-xs" />
          <div className="flex gap-2">
            <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="btn-ghost !px-3 !py-1.5 text-xs">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Téléverser
            </button>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryManager({ initial }: { initial: GalleryItem[] }) {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (g: GalleryItem) => {
    setEditing(g);
    setForm({ title: g.title, vehicle: g.vehicle, category: g.category, description: g.description || '', beforeImage: g.beforeImage, afterImage: g.afterImage, featured: !!g.featured, year: String(g.year || new Date().getFullYear()) });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.beforeImage || !form.afterImage) { toast('Titre et les deux images sont requis', 'err'); return; }
    setBusy(true);
    try {
      const payload = { ...form, year: Number(form.year) || new Date().getFullYear(), demo: editing ? editing.demo : undefined };
      if (editing) {
        const { record } = await api<{ record: GalleryItem }>('gallery', 'PATCH', editing.id, payload);
        setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
        toast('Réalisation mise à jour');
      } else {
        const { record } = await api<{ record: GalleryItem }>('gallery', 'POST', undefined, payload);
        setRows((r) => [record, ...r]);
        toast('Réalisation ajoutée');
      }
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (g: GalleryItem) => {
    if (!confirm(`Supprimer « ${g.title} » de la galerie ?`)) return;
    try {
      await api('gallery', 'DELETE', g.id);
      setRows((r) => r.filter((x) => x.id !== g.id));
      toast('Réalisation supprimée');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const toggleDemo = async (g: GalleryItem) => {
    try {
      const { record } = await api<{ record: GalleryItem }>('gallery', 'PATCH', g.id, { demo: !g.demo });
      setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
      toast(record.demo ? 'Marquée « visuel illustratif »' : 'Marquée comme réalisation réelle');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<GalleryItem>[] = [
    {
      key: 'preview', header: 'Aperçu',
      render: (g) => (
        <span className="flex gap-1.5">
          <span className="relative block h-12 w-16 overflow-hidden rounded border border-ink-500"><Image src={g.beforeImage} alt="avant" fill sizes="64px" className="object-cover" /></span>
          <span className="relative block h-12 w-16 overflow-hidden rounded border border-ink-500"><Image src={g.afterImage} alt="après" fill sizes="64px" className="object-cover" /></span>
        </span>
      ),
    },
    { key: 'title', header: 'Titre', render: (g) => <span className="font-bold text-white">{g.title}</span> },
    { key: 'category', header: 'Catégorie', render: (g) => CATEGORIES.find((c) => c.id === g.category)?.label || g.category },
    { key: 'demo', header: 'Nature', render: (g) => (
      <button onClick={() => toggleDemo(g)} title="Cliquer pour basculer">
        {g.demo ? <StatusChip label="Illustratif" color="#F59E0B" /> : <StatusChip label="Réelle" color="#22C55E" />}
      </button>
    ) },
    { key: 'featured', header: 'Accueil', render: (g) => (g.featured ? 'Oui' : 'Non') },
  ];

  return (
    <div>
      <PageHeader
        title="Galerie avant/après"
        subtitle="Remplacez les visuels illustratifs par les photos de vos chantiers réels."
        action={<AddButton onClick={startNew} label="Nouvelle réalisation" />}
      />
      <DataTable rows={rows} columns={columns} onEdit={startEdit} onDelete={remove} empty="Aucune réalisation dans la galerie." />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifier la réalisation' : 'Nouvelle réalisation'} wide>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Titre" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Ex. Clio 4 — flanc arrière" required />
            <TextInput label="Véhicule" value={form.vehicle} onChange={(v) => setForm({ ...form, vehicle: v })} placeholder="Ex. Renault Clio 4" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput label="Catégorie" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} />
            <TextInput label="Année" type="number" value={form.year} onChange={(v) => setForm({ ...form, year: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImagePicker label="Photo AVANT" value={form.beforeImage} onChange={(v) => setForm({ ...form, beforeImage: v })} />
            <ImagePicker label="Photo APRÈS" value={form.afterImage} onChange={(v) => setForm({ ...form, afterImage: v })} />
          </div>
          <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <label className="flex items-center gap-3 rounded-lg border border-ink-500 bg-ink-900 px-4 py-3 text-sm text-steel-300">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-[#F04438]" />
            Mettre en avant sur la page d’accueil
          </label>
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </Modal>
    </div>
  );
}
