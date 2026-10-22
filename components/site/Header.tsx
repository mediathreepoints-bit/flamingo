'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, PhoneCall } from 'lucide-react';
import { waLink } from '@/lib/site';
import { stripLocale, withLocale, type Dict, type Locale } from '@/lib/i18n';
import { cx } from '@/lib/format';
import { Logo } from './Logo';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header({
  locale,
  t,
  brand,
  city,
  phone,
  phoneRaw,
  whatsapp,
}: {
  locale: Locale;
  t: Dict;
  brand: string;
  city: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const current = stripLocale(pathname || '/');

  const NAV = [
    { href: '/', label: t.nav.home },
    { href: '/services', label: t.nav.services },
    { href: '/realisations', label: t.nav.works },
    { href: '/a-propos', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open ? 'glass border-b border-white/10 shadow-card' : 'border-b border-transparent bg-gradient-to-b from-black/70 to-transparent',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame-500/60 to-transparent" aria-hidden />
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-5 lg:px-8">
        <Link href={withLocale(locale, '/')} aria-label={`${brand} ${city}`} className="shrink-0">
          <Logo brand={brand} city={city} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {NAV.map((item) => {
            const active = current === item.href;
            return (
              <Link
                key={item.href}
                href={withLocale(locale, item.href)}
                className={cx(
                  'group relative py-2 text-sm font-semibold uppercase tracking-wider transition-colors',
                  active ? 'text-white' : 'text-steel-300 hover:text-white',
                )}
              >
                {item.label}
                <span
                  className={cx(
                    'absolute -bottom-0.5 left-0 right-0 h-0.5 origin-left rounded-full bg-gradient-to-r from-flame-400 to-flame-600 transition-transform duration-300',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <LocaleSwitcher locale={locale} />
          <a
            href={`tel:${phoneRaw}`}
            className="hidden items-center gap-2 text-sm font-bold text-white transition-colors hover:text-flame-400 md:flex"
          >
            <PhoneCall className="h-4 w-4 text-flame-500" aria-hidden />
            {phone}
          </a>
          <Link href={withLocale(locale, '/devis')} className="btn-primary hidden !px-4 !py-2 text-[11px] sm:inline-flex">
            {t.common.freeQuote}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/5 lg:hidden"
            aria-label="Navigation mobile"
          >
            <div className="space-y-1 px-5 pb-6 pt-3">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={withLocale(locale, item.href)}
                    className={cx(
                      'block rounded-lg px-4 py-3 font-display text-2xl font-black uppercase tracking-wide transition-colors',
                      current === item.href ? 'bg-flame-500/10 text-flame-400' : 'text-white hover:bg-white/5',
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <a href={`tel:${phoneRaw}`} className="btn-ghost !border-white/15 !bg-white/5">
                  <PhoneCall className="h-4 w-4 text-flame-500" /> {phone}
                </a>
                <a
                  href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !bg-[#25D366] hover:!bg-[#1EBE5A]"
                >
                  {t.common.whatsapp}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
