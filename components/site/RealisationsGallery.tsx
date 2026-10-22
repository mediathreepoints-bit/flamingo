'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import BeforeAfter from './BeforeAfter';
import { WhatsAppIcon } from './WhatsAppFab';
import { CATEGORIES, type GalleryItem } from '@/lib/types';
import { waLink } from '@/lib/site';
import { cx } from '@/lib/format';
import { withLocale, type Dict, type Locale } from '@/lib/i18n';
import AtelierGallery from './AtelierGallery';

export default function RealisationsGallery({ items, whatsapp, t, locale }: { items: GalleryItem[]; whatsapp: string; t: Dict; locale: Locale }) {
  const [filter, setFilter] = useState('tous');
  const visible = useMemo(() => items.filter((i) => filter === 'tous' || i.category === filter), [items, filter]);
  const [positions, setPositions] = useState<Record<string, number>>({});
  useEffect(() => setPositions({}), [filter]);

  const FILTERS = [{ id: 'tous', label: t.common.all }, ...CATEGORIES.map((c) => ({ id: c.id, label: t.categories[c.id] }))];

  return (
    <div className="bg-ink-950">
      <section className="relative overflow-hidden border-b border-white/5 pt-36 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-flame-500" /> {t.works.kicker}
          </p>
          <h1 className="font-display mt-4 text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-6xl">
            {t.works.title} <span className="text-brand-gradient">{t.works.accent}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-steel-400">{t.works.intro}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cx(
                  'rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-mega transition-all',
                  filter === f.id
                    ? 'border-transparent bg-gradient-to-b from-flame-500 to-flame-600 text-white shadow-red'
                    : 'border-white/10 bg-white/5 text-steel-300 backdrop-blur-md hover:border-white/25 hover:text-white',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        {visible.length === 0 ? (
          <p className="py-20 text-center text-steel-500">{t.works.empty}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {visible.map((item, i) => (
              <motion.figure
                key={item.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                className="card-glass overflow-hidden !rounded-2xl"
              >
                <BeforeAfter
                  before={item.beforeImage}
                  after={item.afterImage}
                  alt={item.title}
                  demo={item.demo}
                  beforeLabel={t.common.before}
                  afterLabel={t.common.after}
                  demoLabel={t.common.demo}
                  position={positions[item.id] ?? 50}
                  onChange={(p) => setPositions((prev) => ({ ...prev, [item.id]: p }))}
                  className="aspect-[16/10] w-full"
                />
                <figcaption className="flex items-center justify-between gap-4 border-t border-white/5 p-5">
                  <div>
                    <p className="font-display text-base font-black uppercase tracking-wide text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs font-bold uppercase tracking-mega text-flame-500">
                      {t.categories[item.category]} • {item.vehicle}
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}

        <AtelierGallery t={t} />

        <div className="card-glass mt-14 flex flex-col items-center justify-between gap-6 !rounded-2xl border-flame-500/25 bg-gradient-to-r from-flame-500/10 via-ink-800 to-ink-800 px-8 py-8 md:flex-row">
          <div>
            <p className="font-display text-2xl font-black uppercase text-white">{t.works.ctaTitle}</p>
            <p className="mt-1 text-sm text-steel-400">{t.works.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={withLocale(locale, '/devis')} className="btn-primary !px-6 !py-3">
              {t.common.freeQuote} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <a
              href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-bold uppercase tracking-mega text-white transition hover:bg-[#1EBE5A]"
            >
              <WhatsAppIcon className="h-4 w-4" /> {t.common.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
