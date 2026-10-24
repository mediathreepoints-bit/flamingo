'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, CarFront, Wrench, FileText, CalendarDays, Receipt, Wallet, Images, Inbox, MessageSquare, Globe, LogOut, Menu, X, Database, BadgePercent, Briefcase , TrendingDown} from 'lucide-react';
import { cx } from '@/lib/format';
import { LogoMark } from '@/components/site/Logo';
import { ToastProvider } from './ui';

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/customers', label: 'Clients', icon: Users },
  { href: '/admin/vehicles', label: 'Véhicules', icon: CarFront },
  { href: '/admin/repairs', label: 'Réparations', icon: Wrench },
  { href: '/admin/quotes', label: 'Devis', icon: FileText },
  { href: '/admin/appointments', label: 'Rendez-vous', icon: CalendarDays },
  { href: '/admin/invoices', label: 'Factures', icon: Receipt },
  { href: '/admin/payments', label: 'Paiements & Soldes', icon: Wallet },
  { href: '/admin/expenses', label: 'Dépenses', icon: TrendingDown },
  { href: '/admin/gallery', label: 'Galerie avant/après', icon: Images },
  { href: '/admin/promotions', label: 'Promotions & remises', icon: BadgePercent },
  { href: '/admin/services', label: 'Services du site', icon: Briefcase },
  { href: '/admin/quote-requests', label: 'Demandes de devis', icon: Inbox },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/settings', label: 'Contenu du site', icon: Globe },
];

export default function AdminShell({ user, mode, children }: { user: string; mode: 'supabase' | 'local'; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [atk, setAtk] = useState<string | null>(null);

  useEffect(() => {
    try { setAtk(sessionStorage.getItem('fk_atk')); } catch { /* stockage indisponible */ }
  }, []);

  // si la session passe par jeton (cookies bloqués), on le garde dans les URLs
  const withAtk = (href: string) => (atk ? `${href}${href.includes('?') ? '&' : '?'}atk=${encodeURIComponent(atk)}` : href);

  const logout = async () => {
    try { sessionStorage.removeItem('fk_atk'); } catch { /* stockage indisponible */ }
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navigation admin">
      {NAV.map((item) => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={withAtk(item.href)}
            onClick={() => setOpen(false)}
            className={cx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
              active ? 'bg-flame-500/15 text-flame-400' : 'text-steel-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <item.icon className={cx('h-4 w-4', active && 'text-flame-500')} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-3 border-b border-ink-600 px-5 py-5">
      <LogoMark size={34} />
      <div>
        <p className="font-display text-sm font-black uppercase leading-none text-white">Flamingo Auto</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-mega text-flame-500">Administration</p>
      </div>
    </div>
  );

  const footerBox = (
    <div className="border-t border-ink-600 p-4">
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-ink-800 px-3 py-2 text-[11px] text-steel-500">
        <Database className="h-3.5 w-3.5 text-flame-500" />
        {mode === 'supabase' ? 'Connecté à Supabase' : 'Base locale (JSON)'}
      </div>
      <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-steel-400 transition hover:bg-danger/10 hover:text-danger">
        <LogOut className="h-4 w-4" /> Déconnexion ({user})
      </button>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-ink-950 lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink-600 bg-ink-900 lg:flex">
          {brand}{nav}{footerBox}
        </aside>

        {/* mobile drawer */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-600 bg-ink-900/95 px-4 py-3 backdrop-blur lg:hidden">
          <Link href={withAtk('/admin')} className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-display text-sm font-black uppercase text-white">Admin</span>
          </Link>
          <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu" className="rounded-lg border border-ink-500 p-2 text-white">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/70 lg:hidden" onClick={() => setOpen(false)}>
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-[280px] flex-col bg-ink-900"
            >
              <div className="flex items-center justify-between pr-3">
                {brand}
                <button onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-lg p-2 text-steel-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav}{footerBox}
            </motion.aside>
          </motion.div>
        )}

        <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
