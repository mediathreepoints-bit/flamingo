'use client';

import Image from 'next/image';
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

/**
 * « AVANT / APRÈS » — section ivoire éditoriale : comparateur encadré d'encre,
 * filtres carrés, mini-tuiles N&B, CTA WhatsApp en bloc encre.
 */
export default function TransformationsSection({ items, whatsapp, t }: { items: GalleryItem[]; whatsapp: string; t: Dict }) {
  const [filter, setFilter] = useState('tous');
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(50);

  const FILTERS = [{ id: 'tous', label: t.common.all }, ...CATEGORIES.map((c) => ({ id: c.id, label: t.categories[c.id] }))];
  const visible = items.filter((i) => filter === 'tous' || i.category === filter);
  const current = visible[Math.min(index, Math.max(0, visible.length - 1))];
  const minis: GalleryItem[] = visible.length
    ? [1, 2].map((off) => visible[(index + off) % visible.length]).filter((m): m is GalleryItem => Boolean(m) && m !== current)
    : [];

  useEffect(() => {
    setIndex(0);
    setPos(50);
  }, [filter]);

  const go = (dir: number) => {
    if (!visible.length) return;
    setIndex((i) => (i + dir + visible.length) % visible.length);
    setPos(50);
  };

  const arrowBtn =
    'flex h-11 w-11 items-center justify-center border border-ink-950/25 text-ink-950 transition hover:bg-ink-950 hover:text-paper';

  return (
    <section id="transformations" className="section-paper relative py-24">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* en-tête : titre poster à gauche, texte + flèches carrées à droite */}
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mono-label flex items-center gap-3 text-flame-600"
            >
              <span className="h-2 w-2 bg-flame-500" aria-hidden /> {t.transform.kicker}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              viewport={{ once: true }}
              className="font-display mt-4 text-5xl uppercase leading-[0.95] text-ink-950 md:text-7xl"
            >
              {t.transform.title} <span className="text-flame-600">{t.transform.accent}</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-end gap-6"
          >
            <p className="max-w-[220px] pb-1 text-sm leading-relaxed text-ink-950/70">{t.transform.discover}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => go(-1)} aria-label={t.common.prev} className={arrowBtn}>
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <button onClick={() => go(1)} aria-label={t.common.next} className={arrowBtn}>
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* filtres carrés */}
        <div className="mt-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cx(
                'mono-label border px-4 py-2 transition-all',
                filter === f.id
                  ? 'border-ink-950 bg-ink-950 text-paper'
                  : 'border-ink-950/25 text-ink-950/70 hover:border-ink-950 hover:text-ink-950',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* grand comparateur + mini-tuiles */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="relative border-2 border-ink-950 bg-ink-950">
              <AnimatePresence mode="wait">
                {current ? (
                  <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
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
                  <div className="flex aspect-[16/10] items-center justify-center text-steel-400">{t.transform.empty}</div>
                )}
              </AnimatePresence>
            </div>

            {/* points de navigation */}
            {visible.length > 1 && (
              <div className="mt-5 flex items-center gap-2">
                {visible.map((_, i) => (
                  <button key={i} onClick={() => { setIndex(i); setPos(50); }} aria-label={`${t.transform.kicker} ${i + 1}`} className="group p-1">
                    <span className={cx('block h-1.5 transition-all', i === index ? 'w-7 bg-flame-500' : 'w-2.5 bg-ink-950/25 group-hover:bg-ink-950/50')} />
                  </button>
                ))}
              </div>
            )}

            {current && (
              <div className="mt-4">
                <p className="font-display text-xl uppercase text-ink-950">{current.title}</p>
                <p className="mono-label mt-1 text-flame-600">{current.vehicle}</p>
              </div>
            )}
          </div>

          {/* mini-tuiles avant / après cliquables */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:grid-rows-2">
            {minis.map((m, mi) => {
              const target = visible.indexOf(m);
              return (
                <button
                  key={`${m.id}-${mi}`}
                  onClick={() => { setIndex(Math.max(target, 0)); setPos(50); }}
                  className="group grid grid-cols-2 gap-2 text-start"
                  aria-label={m.title}
                >
                  {[m.beforeImage, m.afterImage].map((src, si) => (
                    <span key={si} className="relative block aspect-square overflow-hidden border border-ink-950/25 bg-ink-900 transition group-hover:border-ink-950">
                      <Image src={src} alt={`${m.title} — ${si === 0 ? t.common.before : t.common.after}`} fill sizes="160px" className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0" />
                      <span
                        className={cx(
                          'mono-label absolute bottom-1.5 start-1.5 px-2 py-0.5 !text-[9px] text-white',
                          si === 0 ? 'bg-ink-950/85' : 'bg-flame-500/95',
                        )}
                      >
                        {si === 0 ? t.common.before : t.common.after}
                      </span>
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-col items-start justify-between gap-6 border-2 border-ink-950 bg-ink-950 px-8 py-7 md:flex-row md:items-center"
        >
          <div>
            <p className="font-display text-2xl uppercase text-white md:text-3xl">
              {t.transform.ctaTitle1} <span className="text-[#25D366]">{t.transform.ctaAccent}</span>
            </p>
            <p className="mt-1 text-sm text-steel-400">{t.transform.ctaText}</p>
          </div>
          <a
            href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite une estimation pour mon véhicule.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-label shrink-0 bg-[#25D366] px-6 py-4 text-white transition hover:bg-white hover:text-ink-950"
          >
            <WhatsAppIcon className="me-2 inline h-4 w-4" /> {t.common.whatsapp}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
