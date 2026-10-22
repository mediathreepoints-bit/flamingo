'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhoneCall, MapPin } from 'lucide-react';
import { waLink } from '@/lib/site';
import { withLocale, type Dict, type Locale } from '@/lib/i18n';
import { InstagramIcon } from './Icons';
import { Logo } from './Logo';

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
  sloganFr,
  sloganAr,
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
  sloganFr: string;
  sloganAr: string;
  legal: string;
}) {
  const year = new Date().getFullYear();
  const slogan = locale === 'ar' ? sloganAr : locale === 'en' ? t.hero.slogan : sloganFr;
  const secondary = locale === 'ar' ? sloganFr : sloganAr;

  const NAV = [
    { href: '/', label: t.nav.home },
    { href: '/services', label: t.nav.services },
    { href: '/realisations', label: t.nav.works },
    { href: '/a-propos', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];
  const SERVICES = [
    { label: t.categories.carrosserie, href: '/services#carrosserie' },
    { label: t.categories.peinture, href: '/services#peinture' },
    { label: t.categories.polissage, href: '/services#polissage' },
    { label: t.categories.renovation, href: '/services#renovation' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame-500/70 to-transparent" aria-hidden />
      {/* filigrane */}
      <p className="font-display pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[16vw] font-black uppercase leading-none tracking-tight text-white/[0.025]" aria-hidden>
        Flamingo
      </p>

      {/* ——— barre d'infos (maquette) ——— */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-6 px-5 py-8 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
          <Logo brand={brand} city={city} size={40} />
          <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:divide-x lg:divide-white/10 lg:rtl:divide-x-reverse">
            <a href={`tel:${phoneRaw}`} className="group flex items-center gap-3 lg:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:border-flame-500/50">
                <PhoneCall className="h-4 w-4 text-flame-500" />
              </span>
              <span>
                <span className="block text-sm font-bold text-white">{phone}</span>
                <span className="block text-xs text-steel-500">{t.footer.phoneSub}</span>
              </span>
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 lg:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:border-flame-500/50">
                <InstagramIcon className="h-4 w-4 text-flame-500" />
              </span>
              <span>
                <span className="block text-sm font-bold text-white">{instagramHandle}</span>
                <span className="block text-xs text-steel-500">{t.footer.igSub}</span>
              </span>
            </a>
            <span className="flex items-center gap-3 lg:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <MapPin className="h-4 w-4 text-flame-500" />
              </span>
              <span>
                <span className="block text-sm font-bold text-white">{t.common.cityValue}</span>
                <span className="block text-xs text-steel-500">{t.footer.citySub}</span>
              </span>
            </span>
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-flame-500/50 px-5 py-3 text-xs font-bold uppercase tracking-mega text-flame-400 transition hover:bg-flame-500/10 hover:text-flame-300 sm:self-auto"
          >
            <MapPin className="h-4 w-4" /> {t.footer.maps}
          </a>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1.1fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
          <Logo brand={brand} city={city} size={44} />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-steel-400">{slogan}</p>
          <p className={`mt-2 text-lg font-bold text-flame-400 ${locale === 'ar' ? 'font-ar' : 'font-hand'}`} lang={locale === 'ar' ? 'fr' : 'ar'} dir={locale === 'ar' ? 'ltr' : 'rtl'}>
            {secondary}
          </p>
          <p className={`mt-3 text-xl text-white/80 ${locale === 'ar' ? 'font-ar text-lg font-bold' : 'font-hand'}`}>{t.tagline}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}>
          <h3 className="font-display text-xs font-black uppercase tracking-mega text-white">{t.footer.nav}</h3>
          <ul className="mt-5 space-y-3">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={withLocale(locale, n.href)} className="text-sm text-steel-400 transition-colors hover:text-flame-400">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <h3 className="font-display mt-8 text-xs font-black uppercase tracking-mega text-white">{t.footer.services}</h3>
          <ul className="mt-5 space-y-3">
            {SERVICES.map((s) => (
              <li key={s.label}>
                <Link href={withLocale(locale, s.href)} className="text-sm text-steel-400 transition-colors hover:text-flame-400">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}>
          <h3 className="font-display text-xs font-black uppercase tracking-mega text-white">{t.footer.contact}</h3>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a href={`tel:${phoneRaw}`} className="flex items-center gap-3 text-steel-300 transition-colors hover:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <PhoneCall className="h-4 w-4 text-flame-500" />
                </span>
                {phone}
              </a>
            </li>
            <li>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-steel-300 transition-colors hover:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <InstagramIcon className="h-4 w-4 text-flame-500" />
                </span>
                {instagramHandle}
              </a>
            </li>
            <li>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-steel-300 transition-colors hover:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <MapPin className="h-4 w-4 text-flame-500" />
                </span>
                {t.common.cityValue}
              </a>
            </li>
          </ul>
          <a
            href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 w-full !bg-[#25D366] hover:!bg-[#1EBE5A]"
          >
            {t.footer.write}
          </a>
        </motion.div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-steel-500 sm:flex-row lg:px-8">
          <p>
            © {year} {brand} {city}. {t.common.rights}
          </p>
          <p>{legal}</p>
        </div>
      </div>
    </footer>
  );
}
