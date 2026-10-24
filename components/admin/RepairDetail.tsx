'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { StatusChip, useToast } from './ui';
import { api } from './client-api';
import { REPAIR_FLOW, REPAIR_STATUS_META, CATEGORIES, type Customer, type Repair, type Vehicle } from '@/lib/types';
import { cx, fmtDate, fmtMoney } from '@/lib/format';

function Detail({ repair, customers, vehicles }: { repair: Repair; customers: Customer[]; vehicles: Vehicle[] }) {
  const toast = useToast();
  const [current, setCurrent] = useState(repair);
  const [busy, setBusy] = useState(false);

  const client = customers.find((c) => c.id === current.customerId);
  const vehicle = vehicles.find((v) => v.id === current.vehicleId);
  const stepIndex = REPAIR_FLOW.indexOf(current.status);

  const advance = async (status: string) => {
    setBusy(true);
    try {
      const { record } = await api<{ record: Repair }>('repairs', 'PATCH', current.id, { status });
      setCurrent(record);
      toast(`Statut : ${REPAIR_STATUS_META[status as keyof typeof REPAIR_STATUS_META].label}`);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Link href="/admin/repairs" className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-mega text-steel-400 transition hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Retour aux réparations
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white">
          <span className="font-mono text-flame-500">{current.ref}</span> — {vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Véhicule'}
        </h1>
        <StatusChip {...REPAIR_STATUS_META[current.status]} />
      </div>

      {/* progression */}
      <section className="card mb-6 p-6">
        <h2 className="font-display mb-5 text-sm font-black uppercase tracking-mega text-white">Avancement du chantier</h2>
        <div className="flex flex-wrap gap-2">
          {REPAIR_FLOW.map((s, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <button
                key={s}
                onClick={() => !busy && advance(s)}
                className={cx(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-mega transition',
                  active && 'border-flame-500 bg-flame-500 text-white shadow-red',
                  done && 'border-ok/40 bg-ok/10 text-ok',
                  !active && !done && 'border-ink-500 text-steel-400 hover:border-white/30 hover:text-white',
                )}
              >
                {done && <Check className="h-3.5 w-3.5" />}
                {REPAIR_STATUS_META[s].label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display mb-4 text-sm font-black uppercase tracking-mega text-white">Informations</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['Client', client?.nom || '—'],
              ['Téléphone', client?.telephone || '—'],
              ['Véhicule', vehicle ? `${vehicle.marque} ${vehicle.modele}` : '—'],
              ['Immatriculation', vehicle?.immatriculation || '—'],
              ['Catégorie', CATEGORIES.find((c) => c.id === current.category)?.label || current.category],
              ['Priorité', current.priority],
              ['Estimation', current.estimatedAmount ? fmtMoney(current.estimatedAmount) : '—'],
              ['Début', fmtDate(current.startDate)],
              ['Échéance', fmtDate(current.dueDate)],
              ['Livré le', fmtDate(current.deliveredDate)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-ink-600/60 pb-2 last:border-0">
                <dt className="text-steel-500">{k}</dt>
                <dd className="text-right font-semibold capitalize text-steel-100">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-lg bg-ink-900 p-4 text-sm leading-relaxed text-steel-300">{current.description}</p>
        </section>

        <section className="card p-6">
          <h2 className="font-display mb-4 text-sm font-black uppercase tracking-mega text-white">Historique</h2>
          <ol className="relative space-y-5 border-l border-ink-500 pl-6">
            {(current.history || []).slice().reverse().map((h, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative">
                <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border-2 border-ink-700" style={{ background: REPAIR_STATUS_META[h.status]?.color || '#F04438' }} />
                <p className="text-sm font-bold text-white">{REPAIR_STATUS_META[h.status]?.label || h.status}</p>
                <p className="mt-0.5 text-xs text-steel-500">{new Date(h.at).toLocaleString('fr-FR')}</p>
                {h.note && <p className="mt-1 text-xs text-steel-400">{h.note}</p>}
              </motion.li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default function RepairDetail({ repair, customers, vehicles }: { repair: Repair; customers: Customer[]; vehicles: Vehicle[] }) {
  return <Detail repair={repair} customers={customers} vehicles={vehicles} />;
}
