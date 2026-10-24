'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { cx } from '@/lib/format';
import type { Dict } from '@/lib/i18n';

export default function ContactForm({ t }: { t: Dict }) {
  const f = t.contactPage.form;
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = f.errName;
    if (form.message.trim().length < 10) e.message = f.errMessage;
    if (!form.email.trim() && form.phone.replace(/\D/g, '').length < 9) e.email = f.errContact;
    setErrors(e);
    if (Object.keys(e).length) return;

    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
        <p className="mt-3 text-sm text-steel-300">{f.doneText}</p>
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
          <label htmlFor="c-name" className="label">{f.name} *</label>
          <input id="c-name" value={form.name} onChange={set('name')} className={cx('field', errors.name && '!border-danger')} placeholder={f.namePh} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="c-phone" className="label">{f.phone}</label>
          <input id="c-phone" type="tel" value={form.phone} onChange={set('phone')} className="field" placeholder={f.phonePh} />
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="c-email" className="label">{f.email}</label>
        <input id="c-email" type="email" value={form.email} onChange={set('email')} className={cx('field', errors.email && '!border-danger')} placeholder={f.emailPh} />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
      </div>
      <div className="mt-5">
        <label htmlFor="c-message" className="label">{f.message} *</label>
        <textarea id="c-message" rows={5} value={form.message} onChange={set('message')} className={cx('field resize-none', errors.message && '!border-danger')} placeholder={f.messagePh} />
        {errors.message && <p className="mt-1 text-xs text-danger">{errors.message}</p>}
      </div>
      <button type="submit" disabled={state === 'sending'} className="btn-primary mt-7 w-full !py-3.5">
        {state === 'sending' ? <><Loader2 className="h-4 w-4 animate-spin" /> {f.sending}</> : <><Send className="h-4 w-4" /> {f.send}</>}
      </button>
    </form>
  );
}
