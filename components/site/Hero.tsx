'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShieldCheck, Wrench, Users, BadgeCheck } from 'lucide-react';
import HeroSlides from './HeroSlides';
import { WhatsAppIcon } from './WhatsAppFab';
import { waLink } from '@/lib/site';
import { withLocale } from '@/lib/i18n';
import { LogoMark } from './Logo';
import type { Dict, Locale } from '@/lib/i18n';
import { SERVICE_IMAGES } from '@/lib/atelier';

const BADGE_ICONS = [ShieldCheck, Wrench, Users, BadgeCheck];

/**
 * Hero « Editorial Signal » : photo noir & blanc plein cadre, titrage poster
 * (2e ligne en contour), métadonnées monospaces en pied, diaporama cadré.
 */
export default function Hero({
  locale,
  t,
  whatsapp,
  heroImage,
  settings,
}: {
  locale: Locale;
  t: Dict;
  whatsapp: string;
  heroImage: string;
  settings: { heroEyebrow: string; heroTitle1: string; heroTitle2: string; heroSubtitle: string; slogan: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const eyebrow = locale === 'fr' ? settings.heroEyebrow : t.hero.eyebrow;
  const title1 = locale === 'fr' ? settings.heroTitle1 : t.hero.title1;
  const title2 = locale === 'fr' ? settings.heroTitle2 : t.hero.title2;
  const subtitle = locale === 'fr' ? settings.heroSubtitle : t.hero.subtitle;
  const slogan = settings.slogan;

  const slides = [
    { src: SERVICE_IMAGES.carrosserie, label: t.servicesBlock.items[0].title },
    { src: SERVICE_IMAGES.peinture, label: t.servicesBlock.items[1].title },
    { src: SERVICE_IMAGES.polissage, label: t.servicesBlock.items[2].title },
    { src: SERVICE_IMAGES.renovation, label: t.servicesBlock.items[3].title },
  ];

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-black">
      {/* fond photo N&B + voiles encre */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-[6%] h-[112%]">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover grayscale contrast-125" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/90 via-ink-950/55 to-ink-950" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/35 to-ink-950/70" aria-hidden />
      <div className="pointer-events-none absolute inset-0 noise opacity-[0.05]" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-flame-500/16 blur-[140px]" aria-hidden />

      <motion.div style={{ opacity: fade }} className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-36 lg:px-8 lg:pt-44">
        <div className="grid items-end gap-14 lg:grid-cols-12">
          {/* colonne titrage */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mono-label flex items-center gap-3 text-flame-500"
            >
              <span className="h-2 w-2 bg-flame-500" aria-hidden />
              {eyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display mt-6 text-[3rem] uppercase leading-[0.92] text-white sm:text-7xl lg:text-[5.6rem]"
            >
              {title1}
              <span className="text-outline mt-1 block">{title2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-7 max-w-xl border-s-2 border-flame-500 ps-5 text-base leading-relaxed text-steel-300 sm:text-lg"
            >
              {subtitle}
            </motion.p>

            {/* badges : rangée séparée par hairlines */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-9 grid max-w-2xl grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4"
            >
              {t.hero.badges.map((b, i) => {
                const Icon = BADGE_ICONS[i];
                return (
                  <span key={b} className="flex items-start gap-2.5 bg-ink-950/85 p-3.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-flame-500" strokeWidth={2} aria-hidden />
                    <span className="text-[11px] font-bold leading-tight text-white">{b}</span>
                  </span>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link href={withLocale(locale, '/devis')} className="btn-primary !px-7 !py-4">
                {t.hero.ctaQuote} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <a
                href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-label inline-flex items-center justify-center gap-2.5 border border-white/25 px-7 py-4 text-white transition hover:border-[#25D366] hover:bg-[#25D366]/10"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> {t.hero.ctaWa}
              </a>
            </motion.div>

            {/* slogan (mobile) */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className={`mt-7 text-2xl text-flame-400 lg:hidden ${locale === 'ar' ? 'font-ar text-xl font-bold' : 'font-hand'}`}
            >
              {slogan}
            </motion.p>
          </div>

          {/* colonne diaporama */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-5"
          >
            <HeroSlides items={slides} />
          </motion.div>
        </div>

        {/* pied de hero : métadonnées monospaces */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-16 grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 pt-px sm:grid-cols-4"
        >
          {[
            { k: '01', v: t.hero.metaServices ?? '8 services' },
            { k: '02', v: 'FR · EN · AR' },
            { k: '03', v: t.hero.metaCity ?? 'Kénitra, Maroc' },
            { k: '04', v: slogan },
          ].map((m) => (
            <div key={m.k} className="flex items-baseline gap-3 bg-ink-950 px-1 py-4">
              <span className="mono-label text-flame-500" aria-hidden>
                {m.k}
              </span>
              <span className={`truncate text-sm text-steel-300 ${m.k === '04' ? (locale === 'ar' ? 'font-ar' : 'font-hand text-base') : ''}`}>
                {m.v}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* signature discrète */}
      <div className="pointer-events-none absolute bottom-4 end-5 z-10 hidden items-center gap-2 lg:flex" aria-hidden>
        <LogoMark size={22} />
        <span className="mono-label text-steel-500">Flamingo Auto</span>
      </div>
    </section>
  );
}
