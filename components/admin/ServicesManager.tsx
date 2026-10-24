'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { PageHeader, TextInput, TextArea, useToast } from './ui';
import { api } from './client-api';
import { SERVICES8_META } from '@/lib/services-meta';
import type { ServiceContent } from '@/lib/types';

const LABELS: Record<string, string> = {
  carrosserie: 'Carrosserie & Tôlerie',
  peinture: 'Peinture au four',
  polissage: 'Polissage & Lustrage',
  plastiques: 'Réparation plastiques',
  vitrage: 'Vitrage automobile',
  pieces: 'Remplacement de pièces',
  interieur: 'Rénovation intérieure',
  petites: 'Petites réparations',
};

type Loc = { title: string; desc: string; sub: string };
type Form = { image: string; fr: Loc; en: Loc; ar: Loc };

const emptyLoc = (): Loc => ({ title: '', desc: '', sub: '' });

export default function ServicesManager({ initial, defaults }: { initial: ServiceContent[]; defaults: Record<string, { image: string; fr: Loc; en: Loc; ar: Loc }> }) {
  const toast = useToast();
  const [forms, setForms] = useState<Record<string, Form>>(() => {
    const out: Record<string, Form> = {};
    for (const m of SERVICES8_META) {
      const ov = initial.find((r) => r.id === m.id);
      const d = defaults[m.id];
      out[m.id] = {
        image: ov?.image || d.image,
        fr: { title: ov?.fr?.title || d.fr.title, desc: ov?.fr?.desc || d.fr.desc, sub: ov?.fr?.sub || d.fr.sub },
        en: { title: ov?.en?.title || d.en.title, desc: ov?.en?.desc || d.en.desc, sub: ov?.en?.sub || d.en.sub },
        ar: { title: ov?.ar?.title || d.ar.title, desc: ov?.ar?.desc || d.ar.desc, sub: ov?.ar?.sub || d.ar.sub },
      };
    }
    return out;
  });
  const [busy, setBusy] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  const set = (id: string, patch: Partial<Form>) => setForms((f) => ({ ...f, [id]: { ...f[id], ...patch } }));
  const setLoc = (id: string, loc: 'fr' | 'en' | 'ar', patch: Partial<Loc>) =>
    setForms((f) => ({ ...f, [id]: { ...f[id], [loc]: { ...f[id][loc], ...patch } } }));

  const upload = async (id: string, file: File) => {
    setBusy(id);
    try {
      const fd = new FormData();
      fd.append('photos', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload impossible');
      set(id, { image: json.paths[0] });
      toast('Image envoyée');
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(null);
    }
  };

  const save = async (id: string) => {
    setBusy(id);
    try {
      const f = forms[id];
      const payload: ServiceContent = { id, image: f.image, fr: f.fr, en: f.en, ar: f.ar };
      const existing = initial.find((r) => r.id === id);
      if (existing) {
        await api('services', 'PATCH', id, payload);
      } else {
        await api('services', 'POST', undefined, payload);
      }
      toast(`« ${LABELS[id]} » enregistré`);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader title="Services du site" subtitle="Textes et photographies des 8 prestations affichées sur le site (FR / EN / AR)." />
      <div className="grid gap-6 xl:grid-cols-2">
        {SERVICES8_META.map((m) => {
          const f = forms[m.id];
          return (
            <div key={m.id} className="rounded-xl border border-ink-500 bg-ink-900 p-5">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-ink-500 bg-ink-800">
                  {f.image && <Image src={f.image} alt="" fill sizes="112px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-black uppercase tracking-wide text-white">{LABELS[m.id]}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={f.image}
                      onChange={(e) => set(m.id, { image: e.target.value })}
                      placeholder="/images/… ou /uploads/…"
                      className="field !py-2 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => refs.current[m.id]?.click()}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-500 px-3 py-2 text-xs font-bold text-steel-300 transition hover:border-flame-500/50 hover:text-white"
                    >
                      <Upload className="h-3.5 w-3.5" /> Photo
                    </button>
                    <input
                      ref={(el) => { refs.current[m.id] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(m.id, file); e.target.value = ''; }}
                    />
                  </div>
                </div>
              </div>

              {(['fr', 'en', 'ar'] as const).map((loc) => (
                <div key={loc} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <TextInput label={`Titre (${loc.toUpperCase()})`} value={f[loc].title} onChange={(v) => setLoc(m.id, loc, { title: v })} />
                  <TextInput label={`Sous-titre affiché (${loc.toUpperCase()})`} value={f[loc].sub} onChange={(v) => setLoc(m.id, loc, { sub: v })} />
                  <div className="sm:col-span-2">
                    <TextArea label={`Description (${loc.toUpperCase()})`} value={f[loc].desc} onChange={(v) => setLoc(m.id, loc, { desc: v })} rows={2} />
                  </div>
                </div>
              ))}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => save(m.id)}
                  disabled={busy === m.id}
                  className="rounded-lg bg-flame-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-flame-600 disabled:opacity-50"
                >
                  {busy === m.id ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
