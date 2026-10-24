'use client';

import { useMemo, useState } from 'react';
import { PageHeader, DataTable, Modal, TextInput, SelectInput, TextArea, StatusChip, AddButton, useToast, type Column } from './ui';
import { api } from './client-api';
import { APPOINTMENT_TYPE_META, type Appointment, type AppointmentType } from '@/lib/types';
import { fmtDate, todayISO } from '@/lib/format';

const emptyForm = { date: todayISO(), start: '09:00', end: '10:00', type: 'devis', status: 'confirme', name: '', phone: '', vehicleLabel: '', notes: '' };

const STATUS_COLORS: Record<string, { label: string; color: string }> = {
  confirme: { label: 'Confirmé', color: '#22C55E' },
  en_attente: { label: 'En attente', color: '#F59E0B' },
  annule: { label: 'Annulé', color: '#EF4444' },
};

export default function AppointmentsManager({ initial }: { initial: Appointment[] }) {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [view, setView] = useState<'a_venir' | 'tous' | 'passes'>('a_venir');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (a: Appointment) => {
    setEditing(a);
    setForm({ date: a.date, start: a.start, end: a.end, type: a.type, status: a.status, name: a.name, phone: a.phone, vehicleLabel: a.vehicleLabel || '', notes: a.notes || '' });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) { toast('Nom et date requis', 'err'); return; }
    setBusy(true);
    try {
      if (editing) {
        const { record } = await api<{ record: Appointment }>('appointments', 'PATCH', editing.id, form);
        setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
        toast('Rendez-vous mis à jour');
      } else {
        const { record } = await api<{ record: Appointment }>('appointments', 'POST', undefined, form);
        setRows((r) => [record, ...r]);
        toast('Rendez-vous créé');
      }
      setOpen(false);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (a: Appointment) => {
    if (!confirm(`Supprimer le rendez-vous de ${a.name} ?`)) return;
    try {
      await api('appointments', 'DELETE', a.id);
      setRows((r) => r.filter((x) => x.id !== a.id));
      toast('Rendez-vous supprimé');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const visible = useMemo(() => {
    const today = todayISO();
    const sorted = [...rows].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    if (view === 'a_venir') return sorted.filter((a) => a.date >= today);
    if (view === 'passes') return sorted.filter((a) => a.date < today).reverse();
    return sorted;
  }, [rows, view]);

  const columns: Column<Appointment>[] = [
    { key: 'date', header: 'Date', render: (a) => <span className="font-mono text-xs">{fmtDate(a.date)} • {a.start}–{a.end}</span> },
    { key: 'name', header: 'Client', render: (a) => <span className="font-bold text-white">{a.name}</span> },
    { key: 'phone', header: 'Téléphone', render: (a) => <a className="font-mono text-flame-400 hover:underline" href={`tel:${a.phone}`}>{a.phone}</a> },
    { key: 'type', header: 'Motif', render: (a) => <StatusChip {...APPOINTMENT_TYPE_META[a.type as AppointmentType]} /> },
    { key: 'vehicle', header: 'Véhicule', render: (a) => a.vehicleLabel || '—' },
    { key: 'status', header: 'Statut', render: (a) => <StatusChip {...STATUS_COLORS[a.status]} /> },
  ];

  return (
    <div>
      <PageHeader title="Rendez-vous" subtitle="Planning de l’atelier : devis, dépôts, expertises, livraisons." action={<AddButton onClick={startNew} label="Nouveau rendez-vous" />} />

      <div className="mb-4 flex gap-2">
        {(['a_venir', 'tous', 'passes'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-mega transition ${view === v ? 'border-flame-500 bg-flame-500 text-white' : 'border-ink-500 text-steel-400 hover:text-white'}`}>
            {v === 'a_venir' ? 'À venir' : v === 'tous' ? 'Tous' : 'Passés'}
          </button>
        ))}
      </div>

      <DataTable rows={visible} columns={columns} onEdit={startEdit} onDelete={remove} empty="Aucun rendez-vous." />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />
            <TextInput label="Début" type="time" value={form.start} onChange={(v) => setForm({ ...form, start: v })} />
            <TextInput label="Fin" type="time" value={form.end} onChange={(v) => setForm({ ...form, end: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Nom du client" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <TextInput label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput label="Motif" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={(Object.keys(APPOINTMENT_TYPE_META) as AppointmentType[]).map((t) => ({ value: t, label: APPOINTMENT_TYPE_META[t].label }))} />
            <SelectInput label="Statut" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={Object.entries(STATUS_COLORS).map(([value, m]) => ({ value, label: m.label }))} />
            <TextInput label="Véhicule" value={form.vehicleLabel} onChange={(v) => setForm({ ...form, vehicleLabel: v })} placeholder="Ex. Clio 4" />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form>
      </Modal>
    </div>
  );
}
