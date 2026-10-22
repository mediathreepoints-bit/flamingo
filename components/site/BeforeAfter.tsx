'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '@/lib/format';

interface Props {
  before: string;
  after: string;
  alt: string;
  position?: number;
  onChange?: (p: number) => void;
  className?: string;
  demo?: boolean;
  beforeLabel?: string;
  afterLabel?: string;
  demoLabel?: string;
}

/** Comparateur avant/après : glisser, tactile ou flèches (accessibilité). */
export default function BeforeAfter({
  before, after, alt, position = 50, onChange, className, demo,
  beforeLabel = 'Avant', afterLabel = 'Après', demoLabel = 'Visuel illustratif',
}: Props) {
  const set = (p: number) => onChange?.(Math.min(100, Math.max(0, p)));
  return (
    <div dir="ltr" className={cx('relative select-none overflow-hidden', className)}>
      <Image src={after} alt={`${alt} — après réparation`} fill priority sizes="(max-width: 1024px) 100vw, 1200px" className="object-cover" />

      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <div className="relative h-full" style={{ width: position > 0 ? `${(100 / position) * 100}%` : '100%', maxWidth: position > 0 ? undefined : '100%' }}>
          <Image src={before} alt={`${alt} — avant réparation`} fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover grayscale-[0.15]" />
        </div>
      </div>

      {/* pastilles Avant / Après ancrées en bas de chaque moitié (maquette) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between px-4">
        <motion.span initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-full border border-white/25 bg-black/65 px-4 py-1.5 text-[10px] font-black uppercase tracking-mega text-white backdrop-blur-sm">
          {beforeLabel}
        </motion.span>
        <motion.span initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="rounded-full bg-flame-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-mega text-white shadow-red">
          {afterLabel}
        </motion.span>
      </div>

      {demo && (
        <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-mega text-steel-300 backdrop-blur-sm">
          {demoLabel}
        </span>
      )}

      {/* ligne + poignée */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white/90 shadow-[0_0_18px_rgba(0,0,0,0.6)]" />
        <div className="absolute top-1/2 -left-[22px] -translate-y-1/2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/70 text-white backdrop-blur-md">
            <ChevronLeft className="h-4 w-4 -mr-1" />
            <ChevronRight className="h-4 w-4 -ml-1" />
          </div>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => set(Number(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') set(position - 4);
          if (e.key === 'ArrowRight') set(position + 4);
        }}
        aria-label={`Comparer avant / après : ${alt}`}
        className="ba-range absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
