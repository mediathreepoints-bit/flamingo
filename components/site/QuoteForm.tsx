'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cx } from '@/lib/format';
import { waLink } from '@/lib/site';
import { WhatsAppIcon } from './WhatsAppFab';
import type { Dict } from '@/lib/i18n';

const YEARS = Array.from({ length: 31 }, (_, i) => String(new Date().getFullYear() - i));

export default function QuoteForm({ whatsapp, phone, t }: { whatsapp: string; phone: string; t: Dict }) {
  const f = t.quotePage.form;
  const [form, setForm] = useState({ name: '', phone: '', brand: '', model: '', year: '', repairType: '', message: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = f.errName;
    if (form.phone.replace(/\D/g, '').length < 9) e.phone = f.errPhone;
    if (!form.repairType) e.repairType = f.errType;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    if (!validate()) return;
    setState('sending');
    try {
      let paths: string[] = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((file) => fd.append('photos', file));
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upJson = await up.json();
        if (!up.ok) throw new Error(upJson.error || 'Upload error');
        paths = upJson.paths || [];
      }
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photos: paths }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur inconnue');
      setState('done');
    } catch (err: any) {
      setError(err?.message || 'Erreur');
      setState('idle');
    }
  };

  if (state === 'done') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card-glass !rounded-2xl border-ok/30 bg-ok/5 p-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-ok" />
        <h2 className="font-display mt-5 text-2xl font-black uppercase text-white">{f.done}</h2>
        <p className="mt-3 text-sm leading-relaxed text-steel-300">{f.doneText}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={waLink(whatsapp, `Bonjour Flamingo Auto Kénitra, je viens d'envoyer une demande de devis (${form.brand} ${form.model}).`)} target="_blank" rel="noopener noreferrer" className="btn-primary !bg-[#25D366] !px-6 !py-3 from-[#25D366] to-[#1EBE5A] hover:from-[#25D366] hover:to-[#1EBE5A]">
            <WhatsAppIcon className="h-4 w-4" /> {f.contWA}
          </a>
          <a href={`tel:${phone}`} className="btn-ghost !border-white/15 !bg-white/5">{f.call}</a>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card-glass !rounded-2xl p-6 sm:p-8">
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="label">{f.name} *</label>
          <input id="q-name" value={form.name} onChange={set('name')} placeholder={f.namePh} className={cx('field', errors.name && '!border-danger')} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="q-phone" className="label">{f.phone} *</label>
          <input id="q-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder={f.phonePh} className={cx('field', errors.phone && '!border-danger')} />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="q-brand" className="label">{f.brand}</label>
          <input id="q-brand" value={form.brand} onChange={set('brand')} placeholder={f.brandPh} className="field" />
        </div>
        <div>
          <label htmlFor="q-model" className="label">{f.model}</label>
          <input id="q-model" value={form.model} onChange={set('model')} placeholder={f.modelPh} className="field" />
        </div>
        <div>
          <label htmlFor="q-year" className="label">{f.year}</label>
          <select id="q-year" value={form.year} onChange={set('year')} className="field">
            <option value="">{f.yearPh}</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="q-type" className="label">{f.type} *</label>
          <select id="q-type" value={form.repairType} onChange={set('repairType')} className={cx('field', errors.repairType && '!border-danger')}>
            <option value="">{f.yearPh}</option>
            {t.quotePage.types.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          {errors.repairType && <p className="mt-1 text-xs text-danger">{errors.repairType}</p>}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="q-message" className="label">{f.message}</label>
        <textarea id="q-message" rows={4} value={form.message} onChange={set('message')} placeholder={f.messagePh} className="field resize-none" />
      </div>

      {/* upload photos */}
      <div className="mt-5">
        <span className="label">{f.photos}</span>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          className="rounded-xl border-2 border-dashed border-ink-500 bg-ink-900/60 p-6 text-center transition-colors hover:border-flame-500/50"
        >
          <Upload className="mx-auto h-6 w-6 text-steel-500" />
          <p className="mt-2 text-sm text-steel-400">{f.drop}</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-xs font-bold uppercase tracking-mega text-flame-400 hover:text-flame-500">
            {f.browse}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        </div>
        {files.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {files.map((file, i) => (
              <li key={i} className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-900 px-3 py-1.5 text-xs text-steel-300">
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} aria-label={`Retirer ${file.name}`} className="text-steel-500 hover:text-danger">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit" disabled={state === 'sending'} className="btn-primary mt-7 w-full !py-3.5">
        {state === 'sending' ? <><Loader2 className="h-4 w-4 animate-spin" /> {f.sending}</> : f.send}
      </button>
      <p className="mt-3 text-center text-[11px] text-steel-500">{f.privacy}</p>
    </form>
  );
}
