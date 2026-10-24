'use client';

import { useState } from 'react';
import { PageHeader, DataTable, Modal, StatusChip, useToast, type Column } from './ui';
import { api } from './client-api';
import type { ContactMessage } from '@/lib/types';
import { fmtDate } from '@/lib/format';

const STATUS: Record<string, { label: string; color: string }> = {
  nouveau: { label: 'Nouveau', color: '#38BDF8' },
  traite: { label: 'Traité', color: '#22C55E' },
};

export default function MessagesManager({ initial }: { initial: ContactMessage[] }) {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const mark = async (m: ContactMessage) => {
    try {
      const { record } = await api<{ record: ContactMessage }>('messages', 'PATCH', m.id, { status: 'traite' });
      setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
      setSelected(null);
      toast('Message marqué comme traité');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const remove = async (m: ContactMessage) => {
    if (!confirm(`Supprimer le message de ${m.name} ?`)) return;
    try {
      await api('messages', 'DELETE', m.id);
      setRows((r) => r.filter((x) => x.id !== m.id));
      toast('Message supprimé');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<ContactMessage>[] = [
    { key: 'createdAt', header: 'Reçu le', render: (m) => fmtDate(m.createdAt) },
    { key: 'name', header: 'Nom', render: (m) => <span className="font-bold text-white">{m.name}</span> },
    { key: 'contact', header: 'Contact', render: (m) => m.email || m.phone || '—' },
    { key: 'message', header: 'Message', render: (m) => <span className="line-clamp-1 max-w-xs text-steel-400">{m.message}</span> },
    { key: 'status', header: 'Statut', render: (m) => <StatusChip {...STATUS[m.status]} /> },
  ];

  return (
    <div>
      <PageHeader title="Messages" subtitle="Formulaires de contact reçus depuis le site." />
      <DataTable rows={rows} columns={columns} onEdit={(m) => setSelected(m)} onDelete={remove} empty="Aucun message reçu." />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Message — ${selected.name}` : ''}>
        {selected && (
          <div className="space-y-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p className="rounded-lg border border-ink-600 bg-ink-900 p-3"><span className="block text-[10px] font-bold uppercase tracking-mega text-steel-500">Email</span>{selected.email || '—'}</p>
              <p className="rounded-lg border border-ink-600 bg-ink-900 p-3"><span className="block text-[10px] font-bold uppercase tracking-mega text-steel-500">Téléphone</span>{selected.phone || '—'}</p>
            </div>
            <p className="whitespace-pre-wrap rounded-lg bg-ink-900 p-4 text-sm leading-relaxed text-steel-300">{selected.message}</p>
            <div className="flex gap-2">
              {selected.status === 'nouveau' && (
                <button onClick={() => mark(selected)} className="btn-primary !px-4 !py-2 text-xs">Marquer comme traité</button>
              )}
              {selected.email && <a href={`mailto:${selected.email}`} className="btn-ghost !px-4 !py-2 text-xs">Répondre par email</a>}
              {selected.phone && <a href={`tel:${selected.phone}`} className="btn-ghost !px-4 !py-2 text-xs">Appeler</a>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
