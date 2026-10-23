'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck, Wrench, Users, BadgeCheck } from 'lucide-react';
import HeroSlides from './HeroSlides';
import { WhatsAppIcon } from './WhatsAppFab';
import { waLink } from '@/lib/site';
import { withLocale } from '@/lib/i18n';
import { LogoMark } from './Logo';
import type { Dict, Locale } from '@/lib/i18n';
import { SERVICE_IMAGES } from '@/lib/atelier';

const BADGE_ICONS = [ShieldCheck, Wrench, Users, BadgeCheck];

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
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '45%']);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

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
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-ink-950">
      {/* fond photo + dégradés (parallax) */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-[6%] h-[112%]">
        <Image src={heroImage} alt="Flamingo Auto Kénitra" fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/85 via-ink-950/45 to-ink-950" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-transparent to-ink-950/40" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div className="pointer-events-none absolute inset-0 noise opacity-[0.05]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-flame-500/12 blur-[130px]" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[60rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[120px]" aria-hidden />

      {/* diaporama cinématique (desktop) */}
      <HeroSlides items={slides} className="absolute right-10 top-[34%] z-10 hidden w-[40%] max-w-xl lg:block" />

      {/* signalétique murale façon maquette */}
      <div className="pointer-events-none absolute end-8 top-24 z-10 hidden flex-col items-end gap-3 md:flex">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
          <LogoMark size={56} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="font-display text-4xl font-black uppercase leading-none tracking-tight text-flame-500 text-glow-red lg:text-5xl"
        >
          Flamingo
        </motion.p>
        <motion.p
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.95, duration: 0.6 }}
          className="font-display text-2xl font-black uppercase leading-none tracking-[0.3em] text-white lg:text-3xl"
        >
          Auto
        </motion.p>
      </div>

      {/* contenu */}
      <motion.div style={{ y: contentY, opacity: fade }} className="relative z-20 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-24 pt-32 lg:px-8">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-mega text-steel-200 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-flame-500 shadow-[0_0_10px_rgba(240,68,56,0.9)]" />
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mt-6 text-[2.6rem] font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {title1}
            <span className="text-brand-gradient mt-1 block drop-shadow-[0_0_28px_rgba(240,68,56,0.35)]">{title2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-steel-200 sm:text-lg"
          >
            {subtitle}
          </motion.p>

          {/* badges de confiance (maquette) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-7 flex flex-wrap gap-x-7 gap-y-4"
          >
            {t.hero.badges.map((b, i) => {
              const Icon = BADGE_ICONS[i];
              return (
                <span key={b} className="flex items-center gap-2.5">
                  <Icon className="h-5 w-5 shrink-0 text-flame-500" strokeWidth={1.9} />
                  <span className="max-w-[130px] text-xs font-semibold leading-tight text-white">{b}</span>
                </span>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href={withLocale(locale, '/devis')} className="btn-primary !px-6 !py-3.5">
              {t.hero.ctaQuote} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <a
              href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-ink-900/60 px-6 py-3.5 text-sm font-bold uppercase tracking-mega text-white backdrop-blur-md transition hover:border-[#25D366]/60 hover:bg-[#25D366]/10"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> {t.hero.ctaWa}
            </a>
          </motion.div>

          {/* slogans (mobile / tablette) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.6 }} className="mt-7 lg:hidden">
            <p className={`text-2xl text-flame-400 ${locale === 'ar' ? 'font-ar text-xl font-bold' : 'font-hand'}`}>{slogan}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* slogan manuscrit en bas à droite (maquette) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="pointer-events-none absolute bottom-10 end-10 z-20 hidden text-end lg:block"
      >
        <p className={`-rotate-3 text-3xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] ${locale === 'ar' ? 'font-ar text-2xl font-bold' : 'font-hand'}`}>
          {slogan}
        </p>
        <span className="mt-1 ms-auto block h-1 w-24 rounded-full bg-gradient-to-r from-flame-500 to-transparent" aria-hidden />
      </motion.div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-steel-400 md:flex"
        aria-hidden
      >
        <span className="text-[10px] font-bold uppercase tracking-mega">{t.common.discover}</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.div>
    </section>
  );
}
