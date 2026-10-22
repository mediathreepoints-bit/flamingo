'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BeforeAfter from './BeforeAfter';
import { WhatsAppIcon } from './WhatsAppFab';
import type { GalleryItem } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import { cx } from '@/lib/format';
import { waLink } from '@/lib/site';
import type { Dict } from '@/lib/i18n';

export default function TransformationsSection({ items, whatsapp, t }: { items: GalleryItem[]; whatsapp: string; t: Dict }) {
  const [filter, setFilter] = useState('tous');
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(50);

  const FILTERS = [{ id: 'tous', label: t.common.all }, ...CATEGORIES.map((c) => ({ id: c.id, label: t.categories[c.id] }))];
  const visible = items.filter((i) => filter === 'tous' || i.category === filter);
  const current = visible[Math.min(index, Math.max(0, visible.length - 1))];

  useEffect(() => {
    setIndex(0);
    setPos(50);
  }, [filter]);

  const go = (dir: number) => {
    if (!visible.length) return;
    setIndex((i) => (i + dir + visible.length) % visible.length);
    setPos(50);
  };

  return (
    <section id="transformations" className="relative border-y border-white/5 bg-ink-950 py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[130px]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-flame-500" /> {t.transform.kicker}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              viewport={{ once: true }}
              className="font-display mt-4 text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-5xl"
            >
              {t.transform.title} <span className="text-brand-gradient">{t.transform.accent}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-4 max-w-xl text-base leading-relaxed text-steel-400"
            >
              {t.transform.intro}
            </motion.p>
          </div>

          {/* filtres */}
          <div className="flex flex-wrap gap-2">
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

        {/* carrousel */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="card-glass relative overflow-hidden !rounded-2xl">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div key={current.id} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.985 }} transition={{ duration: 0.4 }}>
                  <BeforeAfter
                    before={current.beforeImage}
                    after={current.afterImage}
                    alt={current.title}
                    position={pos}
                    onChange={setPos}
                    demo={current.demo}
                    beforeLabel={t.common.before}
                    afterLabel={t.common.after}
                    demoLabel={t.common.demo}
                    className="aspect-[16/10] w-full"
                  />
                </motion.div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-steel-500">{t.transform.empty}</div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-6 lg:flex-col lg:justify-center">
            <div className="flex items-center gap-2 lg:flex-col">
              <button onClick={() => go(-1)} aria-label="Précédent" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-md transition hover:border-flame-500 hover:text-flame-400">
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <div className="flex items-center gap-2">
                {visible.map((_, i) => (
                  <button key={i} onClick={() => { setIndex(i); setPos(50); }} aria-label={`Réalisation ${i + 1}`} className="group p-1">
                    <span className={cx('block h-2.5 rounded-full transition-all', i === index ? 'w-8 bg-flame-500 shadow-[0_0_12px_rgba(240,68,56,0.8)]' : 'w-2.5 bg-white/20 group-hover:bg-white/40')} />
                  </button>
                ))}
              </div>
              <button onClick={() => go(1)} aria-label="Suivant" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-md transition hover:border-flame-500 hover:text-flame-400">
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </div>
            {current && (
              <div className="hidden max-w-[240px] lg:block">
                <p className="font-display text-lg font-black uppercase text-white">{current.title}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-mega text-flame-500">{current.vehicle}</p>
                <p className="mt-2 text-sm leading-relaxed text-steel-400">{current.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-glass mt-14 flex flex-col items-center justify-between gap-6 !rounded-2xl border-[#25D366]/25 bg-gradient-to-r from-[#25D366]/12 via-ink-800 to-ink-800 px-8 py-7 md:flex-row"
        >
          <div>
            <p className="font-display text-xl font-black uppercase text-white md:text-2xl">
              {t.transform.ctaTitle1} <span className="text-[#25D366]">{t.transform.ctaAccent}</span>
            </p>
            <p className="mt-1 text-sm text-steel-400">{t.transform.ctaText}</p>
          </div>
          <a
            href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite une estimation pour mon véhicule.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine shrink-0 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-bold uppercase tracking-mega text-white transition hover:bg-[#1EBE5A] hover:shadow-[0_10px_44px_-8px_rgba(37,211,102,0.55)]"
          >
            <WhatsAppIcon className="me-2 inline h-4 w-4" /> {t.common.whatsapp}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
