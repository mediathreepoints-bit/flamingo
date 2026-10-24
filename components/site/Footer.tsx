'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhoneCall, MapPin, KeyRound } from 'lucide-react';
import { waLink } from '@/lib/site';
import { withLocale, type Dict, type Locale } from '@/lib/i18n';
import { InstagramIcon } from './Icons';
import { Logo } from './Logo';

/**
 * Footer éditorial : wordmark poster géant en contour, colonnes monospaces,
 * barre finale hairline avec signature manuscrite rouge.
 */
export default function Footer({
  locale,
  t,
  brand,
  city,
  phone,
  phoneRaw,
  whatsapp,
  instagram,
  instagramHandle,
  mapUrl,
  legal,
}: {
  locale: Locale;
  t: Dict;
  brand: string;
  city: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  instagram: string;
  instagramHandle: string;
  mapUrl: string;
  legal: string;
}) {
  const year = new Date().getFullYear();
  const slogan = t.hero.slogan;

  const NAV = [
    { href: '/', label: t.nav.home },
    { href: '/services', label: t.nav.services },
    { href: '/realisations', label: t.nav.works },
    { href: '/a-propos', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];

  return (
    <footer className="relative overflow-hidden bg-paper pt-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 pb-16 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
          {/* marque */}
          <div>
            <span className="inline-flex rounded-2xl bg-ink-950 p-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]">
              <Logo brand={brand} city={city} size={44} />
            </span>
            <p className={`mt-5 max-w-xs text-2xl leading-snug text-flame-500 ${locale === 'ar' ? 'font-ar text-xl font-bold' : 'font-hand'}`}>
              {slogan}
            </p>
            <p className="mono-label mt-6 text-[#6E6E73]">{t.tagline}</p>
          </div>

          {/* navigation */}
          <nav aria-label={t.footer.nav}>
            <p className="mono-label text-flame-500">{t.footer.nav}</p>
            <ul className="mt-5 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={withLocale(locale, item.href)}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-[#424245] transition-colors hover:text-ink-950"
                  >
                    <span className="h-px w-0 bg-flame-500 transition-all duration-300 group-hover:w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* prestations */}
          <div>
            <p className="mono-label text-flame-500">{t.footer.services}</p>
            <ul className="mt-5 space-y-2.5">
              {t.servicesBlock.items.map((s) => (
                <li key={s.title}>
                  <Link
                    href={withLocale(locale, '/services')}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-[#424245] transition-colors hover:text-ink-950"
                  >
                    <span className="h-px w-0 bg-flame-500 transition-all duration-300 group-hover:w-4" aria-hidden />
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <p className="mono-label text-flame-500">{t.footer.contact}</p>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a href={`tel:${phoneRaw}`} className="group flex items-start gap-3 text-[#424245] transition-colors hover:text-ink-950">
                  <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-flame-500" aria-hidden />
                  <span>
                    <span dir="ltr" className="block font-bold text-ink-950">{phone}</span>
                    <span className="mono-label !text-[10px] text-[#6E6E73]">{t.footer.phoneSub}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono-label inline-flex items-center gap-2.5 border border-[#86868B] px-4 py-2.5 text-ink-950 transition hover:border-[#25D366] hover:bg-[#25D366]/10"
                >
                  <WhatsAppDot /> {t.footer.write}
                </a>
              </li>
              {instagram && (
                <li>
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-[#424245] transition-colors hover:text-ink-950">
                    <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0 text-flame-500" />
                    <span>
                      <span className="block font-bold text-ink-950">{instagramHandle}</span>
                      <span className="mono-label !text-[10px] text-[#6E6E73]">{t.footer.igSub}</span>
                    </span>
                  </a>
                </li>
              )}
              <li>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-[#424245] transition-colors hover:text-ink-950">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame-500" aria-hidden />
                  <span>
                    <span className="block font-bold text-ink-950">{city}</span>
                    <span className="mono-label !text-[10px] text-[#6E6E73]">{t.footer.citySub} — {t.footer.maps}</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* wordmark géant en contour */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none select-none px-2"
        aria-hidden
      >
        <p className="text-outline-ink whitespace-nowrap text-center font-display text-[13.5vw] uppercase leading-[0.8] opacity-70">
          Flamingo
        </p>
      </motion.div>

      {/* barre finale */}
      <div className="border-t border-[#D2D2D7]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 md:flex-row lg:px-8">
          <p className="mono-label !text-[10px] text-[#6E6E73]">
            © {year} {brand} — {legal}
          </p>
          <div className="flex items-center gap-5">
            <p className="mono-label !text-[10px] text-[#6E6E73]">
              {city} <span className="mx-2 text-flame-500" aria-hidden>▪</span> FR · EN · AR
            </p>
            <Link
              href="/admin"
              className="mono-label !text-[10px] inline-flex items-center gap-1.5 text-[#6E6E73] transition-colors hover:text-flame-600"
            >
              <KeyRound className="h-3 w-3" aria-hidden /> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppDot() {
  return <span className="h-2 w-2 bg-[#25D366]" aria-hidden />;
}
