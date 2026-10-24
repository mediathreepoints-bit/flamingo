'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { apiUrl, PHP_MODE } from '@/lib/client-env';

export default function LoginForm({ mode }: { mode: 'supabase' | 'local' }) {
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState(mode === 'supabase' ? '' : 'admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Connexion impossible');
      const base = params.get('next') || '/admin';
      if (json.token) {
        // session par jeton : fonctionne même si les cookies sont bloqués (iframe aperçu)
        try { sessionStorage.setItem('fk_atk', json.token); } catch { /* stockage indisponible */ }
        router.push(`${base}${base.includes('?') ? '&' : '?'}atk=${encodeURIComponent(json.token)}`);
      } else {
        router.push(base);
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Connexion impossible');
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-5">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-25" aria-hidden />
      <div className="pointer-events-none fixed left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[120px]" aria-hidden />
      <motion.form
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800/90 p-8 shadow-lift backdrop-blur"
      >
        <div className="flex justify-center"><Logo size={44} /></div>
        <h1 className="font-display mt-6 text-center text-xl font-black uppercase tracking-wide text-white">Espace administrateur</h1>
        <p className="mt-1 text-center text-xs text-steel-500">
          {mode === 'supabase' ? 'Connexion via Supabase Auth' : 'Connexion locale (mode démonstration)'}
        </p>

        <div className="mt-7 space-y-4">
          <div>
            <label htmlFor="login-id" className="label">{mode === 'supabase' ? 'Email' : 'Identifiant'}</label>
            <input id="login-id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="field" autoComplete="username" required />
          </div>
          <div>
            <label htmlFor="login-pw" className="label">Mot de passe</label>
            <input id="login-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoComplete="current-password" required />
          </div>
          {error && <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="h-4 w-4" /> Se connecter</>}
          </button>
          {/* Indice de démonstration : uniquement si NEXT_PUBLIC_ADMIN_HINT est défini.
              Jamais de mot de passe en littéral dans le JS public (variante PHP). */}
          {mode === 'local' && !PHP_MODE && process.env.NEXT_PUBLIC_ADMIN_HINT && (
            <p className="text-center text-[11px] text-steel-500">
              Par défaut&nbsp;: <span className="font-mono text-steel-300">admin</span> /{' '}
              <span className="font-mono text-steel-300">{process.env.NEXT_PUBLIC_ADMIN_HINT}</span>
            </p>
          )}
        </div>
      </motion.form>
    </div>
  );
}
