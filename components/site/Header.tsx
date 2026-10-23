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
import PromoBar from './PromoBar';
import type { Promotion } from '@/lib/types';

/**
 * Header « Editorial Signal » : barre encre à hairline, nav monospace,
 * CTA rouge vif à angles vifs, menu mobile plein écran typographié.
 */
export default function Header({
  locale,
  t,
  brand,
  city,
  phone,
  phoneRaw,
  whatsapp,
  promo,
}: {
  locale: Locale;
  t: Dict;
  brand: string;
  city: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  promo: Promotion | null;
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
        scrolled || open
          ? 'border-b border-white/10 bg-ink-950/95 backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-ink-950/85 to-transparent',
      )}
    >
      <PromoBar t={t} promo={promo} />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 lg:h-20 lg:px-8">
        <Link href={withLocale(locale, '/')} aria-label={`${brand} ${city}`} className="shrink-0">
          <Logo brand={brand} city={city} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          {NAV.map((item, i) => {
            const active = current === item.href;
            return (
              <Link
                key={item.href}
                href={withLocale(locale, item.href)}
                className={cx(
                  'group mono-label relative py-2 transition-colors',
                  active ? 'text-white' : 'text-steel-400 hover:text-white',
                )}
              >
                <span className="me-1.5 text-flame-500" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.label}
                <span
                  className={cx(
                    'absolute -bottom-0.5 left-0 right-0 h-0.5 bg-flame-500 transition-transform duration-300',
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
            className="mono-label hidden items-center gap-2 text-white transition-colors hover:text-flame-400 md:flex"
          >
            <span className="flex h-6 w-6 items-center justify-center bg-flame-500" aria-hidden>
              <PhoneCall className="h-3.5 w-3.5 text-white" />
            </span>
            {phone}
          </a>
          <Link
            href={withLocale(locale, '/devis')}
            className="mono-label hidden bg-flame-500 px-4 py-2.5 text-white transition-colors hover:bg-white hover:text-ink-950 sm:inline-flex"
          >
            {t.hero.ctaQuote}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center border border-white/15 text-white transition hover:border-flame-500 hover:text-flame-400 lg:hidden"
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
            className="overflow-hidden border-t border-white/10 bg-ink-950 lg:hidden"
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
                      'flex items-baseline gap-3 border-b border-white/5 px-1 py-3 font-display text-3xl uppercase tracking-wide transition-colors',
                      current === item.href ? 'text-flame-500' : 'text-white hover:text-flame-400',
                    )}
                  >
                    <span className="mono-label text-flame-500" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <a href={`tel:${phoneRaw}`} className="btn-ghost">
                  <PhoneCall className="h-4 w-4 text-flame-500" /> {phone}
                </a>
                <a
                  href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !bg-[#25D366] hover:!bg-[#1EBE5A] hover:!text-white"
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
