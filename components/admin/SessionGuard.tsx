'use client';

import { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/client-env';
import AdminShell from './AdminShell';

/** Garde de session pour la variante export PHP (pas de middleware côté
 *  hosting statique) : vérifie /api/auth/me au montage, redirige vers la
 *  page de connexion sinon, puis rend la coquille admin. La protection des
 *  données reste assurée côté serveur PHP (401 sur toutes les routes admin). */
export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    fetch(apiUrl('/api/auth/me'), { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error('session invalide');
        const j = await r.json();
        if (!on) return;
        setUser(String(j.user || 'admin'));
      })
      .catch(() => {
        if (on) window.location.href = apiUrl('/admin/login/');
      });
    return () => { on = false; };
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <p className="text-sm font-semibold text-steel-500">Vérification de la session…</p>
      </div>
    );
  }
  return <AdminShell user={user} mode="local">{children}</AdminShell>;
}
