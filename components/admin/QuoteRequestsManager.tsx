'use client';

import { apiUrl } from '@/lib/client-env';

import { useLiveRows } from './live';

import Image from 'next/image';
import { useState } from 'react';
import { PhoneCall, FilePlus2 } from 'lucide-react';
import { PageHeader, DataTable, Modal, StatusChip, useToast, type Column } from './ui';
import { api } from './client-api';
import { waLink } from '@/lib/site';
import type { QuoteRequest } from '@/lib/types';
import { fmtDate } from '@/lib/format';

const STATUS: Record<string, { label: string; color: string }> = {
  nouveau: { label: 'Nouveau', color: '#38BDF8' },
  traite: { label: 'Traité', color: '#22C55E' },
  converti: { label: 'Converti en devis', color: '#A78BFA' },
};

export default function QuoteRequestsManager({ initial }: { initial: QuoteRequest[] }) {
  const toast = useToast();
  const [rows, setRows] = useLiveRows('quoteRequests', initial);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [busy, setBusy] = useState(false);

  const setStatus = async (q: QuoteRequest, status: string) => {
    try {
      const { record } = await api<{ record: QuoteRequest }>('quoteRequests', 'PATCH', q.id, { status });
      setRows((r) => r.map((x) => (x.id === record.id ? record : x)));
      setSelected(null);
      toast('Statut mis à jour');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const convert = async (q: QuoteRequest) => {
    setBusy(true);
    try {
      const { record } = await api<{ record: any }>('quotes', 'POST', undefined, {
        customerName: q.name,
        customerPhone: q.phone,
        source: 'site',
        status: 'brouillon',
        notes: [
          q.repairType ? `Demande : ${q.repairType}` : '',
          q.brand || q.model ? `Véhicule : ${[q.brand, q.model, q.year].filter(Boolean).join(' ')}` : '',
          q.message ? `Message : ${q.message}` : '',
          q.photos?.length ? `${q.photos.length} photo(s) jointe(s) à la demande` : '',
        ].filter(Boolean).join('\n'),
        items: [],
      });
      await api('quoteRequests', 'PATCH', q.id, { status: 'converti' });
      setRows((r) => r.map((x) => (x.id === q.id ? { ...x, status: 'converti' } : x)));
      setSelected(null);
      toast(`Brouillon de devis ${record.ref} créé — complétez-le dans « Devis »`);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (q: QuoteRequest) => {
    if (!confirm(`Supprimer la demande de ${q.name} ?`)) return;
    try {
      await api('quoteRequests', 'DELETE', q.id);
      setRows((r) => r.filter((x) => x.id !== q.id));
      toast('Demande supprimée');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const columns: Column<QuoteRequest>[] = [
    { key: 'createdAt', header: 'Reçue le', render: (q) => fmtDate(q.createdAt) },
    { key: 'name', header: 'Client', render: (q) => <span className="font-bold text-white">{q.name}</span> },
    { key: 'phone', header: 'Téléphone', render: (q) => <a className="font-mono text-flame-400 hover:underline" href={`tel:${q.phone}`}>{q.phone}</a> },
    { key: 'vehicle', header: 'Véhicule', render: (q) => [q.brand, q.model, q.year].filter(Boolean).join(' ') || '—' },
    { key: 'type', header: 'Demande', render: (q) => q.repairType || '—' },
    { key: 'photos', header: 'Photos', render: (q) => (q.photos?.length ? `${q.photos.length}` : '—') },
    { key: 'status', header: 'Statut', render: (q) => <StatusChip {...STATUS[q.status]} /> },
  ];

  return (
    <div>
      <PageHeader title="Demandes de devis" subtitle="Formulaires reçus depuis le site public." />
      <DataTable rows={rows} columns={columns} onEdit={(q) => setSelected(q)} onDelete={remove} empty="Aucune demande reçue." />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Demande — ${selected.name}` : ''} wide>
        {selected && (
          <div className="space-y-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ['Téléphone', selected.phone],
                ['Reçue le', fmtDate(selected.createdAt)],
                ['Véhicule', [selected.brand, selected.model, selected.year].filter(Boolean).join(' ') || '—'],
                ['Type de réparation', selected.repairType || '—'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-ink-600 bg-ink-900 p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-mega text-steel-500">{k}</dt>
                  <dd className="mt-1 font-semibold text-steel-100">{v}</dd>
                </div>
              ))}
            </dl>
            {selected.message && (
              <div>
                <p className="label">Message</p>
                <p className="rounded-lg bg-ink-900 p-4 text-sm leading-relaxed text-steel-300">{selected.message}</p>
              </div>
            )}
            {selected.photos?.length > 0 && (
              <div>
                <p className="label">Photos des dégâts</p>
                <div className="flex flex-wrap gap-2">
                  {selected.photos.map((p) => (
                    <a key={p} href={apiUrl(p)} target="_blank" rel="noopener noreferrer" className="relative block h-24 w-32 overflow-hidden rounded-lg border border-ink-500">
                      <Image src={p} alt="Photo des dégâts" fill sizes="128px" className="object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => convert(selected)} disabled={busy} className="btn-primary !px-4 !py-2 text-xs">
                <FilePlus2 className="h-3.5 w-3.5" /> {busy ? 'Conversion…' : 'Convertir en devis'}
              </button>
              <a href={waLink('212661508674', `Bonjour ${selected.name}, ici Flamingo Auto Kénitra, concernant votre demande de devis.`)} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-4 !py-2 text-xs">
                <PhoneCall className="h-3.5 w-3.5 text-[#25D366]" /> Répondre
              </a>
              <button onClick={() => setStatus(selected, 'traite')} className="btn-ghost !px-4 !py-2 text-xs">Marquer traité</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
