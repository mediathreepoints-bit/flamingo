'use client';

import { useEffect, useState } from 'react';
import { api } from './client-api';
import DashboardView, { type DashboardData } from './DashboardView';

const ENTITIES = [
  'customers', 'vehicles', 'repairs', 'quotes', 'invoices', 'payments',
  'appointments', 'quoteRequests', 'messages', 'gallery', 'promotions', 'expenses',
] as const;

/** Tableau de bord en mode export PHP : charge les 12 collections depuis
 *  l'API PHP puis rend exactement la même vue que le mode Node. */
export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let on = true;
    Promise.all(ENTITIES.map((e) => api<{ rows: any[] }>(e, 'GET').then((r) => r.rows || []).catch(() => [])))
      .then((lists) => {
        if (!on) return;
        const d = Object.fromEntries(ENTITIES.map((e, i) => [e, lists[i]])) as unknown as DashboardData;
        setData(d);
      })
      .catch((e: any) => { if (on) setError(e?.message || 'Erreur de chargement'); });
    return () => { on = false; };
  }, []);

  if (error) {
    return <p className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">{error}</p>;
  }
  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-steel-500">Chargement du tableau de bord…</p>
      </div>
    );
  }
  return <DashboardView {...data} />;
}
