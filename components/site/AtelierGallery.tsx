'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { REAL_PHOTOS, MOSAIC_ORDER, type AtelierPhoto } from '@/lib/atelier';
import type { Dict } from '@/lib/i18n';
import { cx } from '@/lib/format';

function tagLabel(photo: AtelierPhoto, t: Dict) {
  return photo.category === 'atelier' ? t.atelier.tag : t.categories[photo.category];
}

function PhotoCard({ photo, t, index }: { photo: AtelierPhoto; t: Dict; index: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
      className={cx('group card-glass mb-5 break-inside-avoid overflow-hidden !rounded-2xl', photo.wide ? 'relative' : 'relative')}
    >
      <div className="relative overflow-hidden">
        <Image
          src={photo.src}
          alt={t.atelier.captions[photo.caption]}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
          width={1440}
          height={photo.wide ? 900 : 1440}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" aria-hidden />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/40 bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-mega text-[#22C55E] backdrop-blur-md">
          <Camera className="h-3 w-3" /> {t.atelier.real}
        </span>
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <p className="text-sm font-semibold leading-snug text-white">{t.atelier.captions[photo.caption]}</p>
          <span className="shrink-0 rounded-full bg-flame-500/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-mega text-white">
            {tagLabel(photo, t)}
          </span>
        </figcaption>
      </div>
    </motion.figure>
  );
}

/**
 * Mosaïque (ou bande défilante) des photographies RÉELLES de l'atelier.
 * variant="mosaic" : grille en colonnes (page Réalisations)
 * variant="strip"  : défilement horizontal aimanté (page d'accueil)
 */
export default function AtelierGallery({ t, variant = 'mosaic' }: { t: Dict; variant?: 'mosaic' | 'strip' }) {
  if (variant === 'strip') {
    const photos = MOSAIC_ORDER.slice(0, 6).map((i) => REAL_PHOTOS[i]);
    return (
      <section className="relative border-y border-white/5 bg-ink-950 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-[#22C55E] backdrop-blur-md">
                <Camera className="h-3.5 w-3.5" /> {t.atelier.kicker}
              </p>
              <h2 className="font-display mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                {t.atelier.title} <span className="text-brand-gradient">{t.atelier.accent}</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-steel-400">{t.atelier.intro}</p>
          </div>
        </div>
        <div className="mt-10 flex gap-5 overflow-x-auto px-5 pb-4 [scroll-snap-type:x_mandatory] lg:px-8">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group card-glass relative w-[78vw] shrink-0 overflow-hidden !rounded-2xl [scroll-snap-align:start] sm:w-[46vw] lg:w-[30vw]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={photo.src} alt={t.atelier.captions[photo.caption]} fill sizes="(max-width: 1024px) 80vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" aria-hidden />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/40 bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-mega text-[#22C55E] backdrop-blur-md">
                  <Camera className="h-3 w-3" /> {t.atelier.real}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                  <p className="text-sm font-semibold leading-snug text-white">{t.atelier.captions[photo.caption]}</p>
                  <span className="shrink-0 rounded-full bg-flame-500/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-mega text-white">{tagLabel(photo, t)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative border-t border-white/5 bg-ink-950 py-20">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-[#22C55E] backdrop-blur-md">
              <Camera className="h-3.5 w-3.5" /> {t.atelier.kicker}
            </p>
            <h2 className="font-display mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              {t.atelier.title} <span className="text-brand-gradient">{t.atelier.accent}</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-steel-400">{t.atelier.intro}</p>
        </div>

        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {MOSAIC_ORDER.map((photoIndex, i) => (
            <PhotoCard key={REAL_PHOTOS[photoIndex].src} photo={REAL_PHOTOS[photoIndex]} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
