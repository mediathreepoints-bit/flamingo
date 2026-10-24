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
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0.35 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0.35 }),
};

/**
 * Diaporama éditorial : cadre à angles vifs, image noir & blanc qui se
 * colore au survol, légende monospace indexée, slides auto toutes les 4,5 s.
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
  }, [paused, items.length]);

  const go = (d: number) => {
    setDir(d);
    setIndex((i) => (i + d + items.length) % items.length);
  };

  return (
    <div
      className={cx('group', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Prestations de l’atelier en images"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/15 bg-ink-800">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.06 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Image
                src={items[index].src}
                alt={items[index].label}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* légende monospace indexée */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-white/15 bg-ink-950/90 px-4 py-2.5"
        >
          <span className="mono-label text-flame-500" aria-hidden>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="mono-label truncate text-white">{items[index].label}</span>
        </motion.div>

        {/* flèches carrées */}
        <button
          onClick={() => go(-1)}
          aria-label="Image précédente"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/60 p-2 text-white opacity-0 transition hover:border-flame-500 hover:text-flame-400 focus:opacity-100 group-hover:opacity-100"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Image suivante"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/60 p-2 text-white opacity-0 transition hover:border-flame-500 hover:text-flame-400 focus:opacity-100 group-hover:opacity-100"
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>

      {/* progression : barres carrées */}
      <div className="mt-3 flex items-center gap-2">
        {items.map((s, i) => (
          <button
            key={s.src}
            onClick={() => {
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Aller au slide ${i + 1} : ${s.label}`}
            className="group/dot p-1"
          >
            <span
              className={cx(
                'block h-1 transition-all duration-300',
                i === index ? 'w-8 bg-flame-500' : 'w-3 bg-white/25 group-hover/dot:bg-white/50',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
