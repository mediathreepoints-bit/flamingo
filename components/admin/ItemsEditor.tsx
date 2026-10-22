'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { LineItem } from '@/lib/types';
import { fmtMoney, uid } from '@/lib/format';

export function emptyItem(): LineItem {
  return { id: uid('li'), label: '', qty: 1, unit: 'forfait', price: 0 };
}

export default function ItemsEditor({ items, onChange }: { items: LineItem[]; onChange: (items: LineItem[]) => void }) {
  const set = (id: string, patch: Partial<LineItem>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const total = items.reduce((s, it) => s + it.qty * it.price, 0);

  return (
    <div>
      <span className="label">Lignes</span>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-[1fr_70px_90px_110px_36px] items-center gap-2">
            <input value={it.label} onChange={(e) => set(it.id, { label: e.target.value })} placeholder="Désignation" className="field !py-2" />
            <input type="number" min={0} step="0.5" value={it.qty} onChange={(e) => set(it.id, { qty: Number(e.target.value) })} className="field !py-2" aria-label="Quantité" />
            <select value={it.unit} onChange={(e) => set(it.id, { unit: e.target.value })} className="field !py-2" aria-label="Unité">
              {['forfait', 'heure', 'pièce', 'm²'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" min={0} step="10" value={it.price} onChange={(e) => set(it.id, { price: Number(e.target.value) })} className="field !py-2" aria-label="Prix unitaire HT" />
            <button type="button" onClick={() => onChange(items.filter((x) => x.id !== it.id))} aria-label="Supprimer la ligne" className="rounded-lg border border-ink-500 p-2 text-steel-400 transition hover:border-danger/50 hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={() => onChange([...items, emptyItem()])} className="btn-ghost !px-3 !py-2 text-xs">
          <Plus className="h-3.5 w-3.5" /> Ajouter une ligne
        </button>
        <p className="text-sm font-bold text-steel-300">Total HT : <span className="text-white">{fmtMoney(total, { decimals: true })}</span></p>
      </div>
    </div>
  );
}
