'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '@/lib/format';

const SLIDES = [
  { src: '/images/service-carrosserie.jpg', label: 'Carrosserie' },
  { src: '/images/service-peinture.jpg', label: 'Peinture au four' },
  { src: '/images/service-polissage.jpg', label: 'Polissage & Détail' },
  { src: '/images/service-renovation.jpg', label: 'Rénovation automobile' },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0.35, scale: 1.04 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0.35, scale: 1.04 }),
};

/**
 * Diaporama cinématique (remplace l'ancien rendu 3D) :
 * slides automatiques toutes les 4,5 s, transitions glissées,
 * léger zoom pendant l'affichage, pause au survol, flèches + points.
 */
export default function HeroSlides({ className, items = SLIDES }: { className?: string; items?: { src: string; label: string }[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % items.length);
    }, 4500);
    return () => clearInterval(t);
  }, [paused]);

  const go = (d: number) => {
    setDir(d);
    setIndex((i) => (i + d + items.length) % items.length);
  };

  return (
    <div
      className={className}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Prestations de l’atelier en images"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-lift">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.07 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Image
                src={items[index].src}
                alt={items[index].label}
                fill
                sizes="(max-width: 1024px) 0px, 42vw"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" aria-hidden />
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="absolute bottom-4 left-5 flex items-center gap-2 text-xs font-black uppercase tracking-mega text-white"
            >
              <span className="h-px w-6 bg-flame-500" />
              {items[index].label}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* flèches */}
        <button
          onClick={() => go(-1)}
          aria-label="Image précédente"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition hover:border-flame-500 hover:text-flame-400 focus:opacity-100 group-hover:opacity-100 [div:hover>&]:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Image suivante"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition hover:border-flame-500 hover:text-flame-400 focus:opacity-100 [div:hover>&]:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* points de progression */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {items.map((s, i) => (
          <button
            key={s.src}
            onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
            aria-label={`Aller au slide ${i + 1} : ${s.label}`}
            className="group p-1"
          >
            <span
              className={cx(
                'block h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-8 bg-flame-500' : 'w-2.5 bg-white/25 group-hover:bg-white/50',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
