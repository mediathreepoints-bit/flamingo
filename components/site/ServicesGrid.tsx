'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Car, SprayCan, Sparkles, Flame, GlassWater, Package, Armchair, Wrench } from 'lucide-react';
import { withLocale, type Dict, type Locale } from '@/lib/i18n';
import type { Service8 } from '@/lib/services-meta';

const ICON_MAP: Record<string, typeof Car> = { Car, SprayCan, Sparkles, Flame, GlassWater, Package, Armchair, Wrench };

/** 8 cartes prestations premium : photo, icône rouge, titre, description, détails + devis. */
export default function ServicesGrid({ locale, t, items }: { locale: Locale; t: Dict; items: Service8[] }) {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((sv, i) => {
        const Icon = ICON_MAP[sv.icon] || Car;
        return (
          <motion.div
            key={sv.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: 'easeOut' }}
            className="group card-glass relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-flame-500/40"
          >
            <div className="relative h-40 overflow-hidden">
              <Image
                src={sv.image}
                alt={sv.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" aria-hidden />
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 shrink-0 text-flame-500" strokeWidth={1.9} aria-hidden />
                <h3 className="font-display text-sm font-black uppercase leading-tight tracking-wide text-white">{sv.title}</h3>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-steel-400">{sv.desc}</p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <Link
                  href={withLocale(locale, `/services#${sv.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 transition-colors hover:text-flame-500"
                >
                  {t.common.learnMore}
                </Link>
                <Link
                  href={withLocale(locale, '/devis')}
                  aria-label={`${t.common.freeQuote} — ${sv.title}`}
                  title={t.common.freeQuote}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 group-hover:border-flame-500 group-hover:bg-gradient-to-b group-hover:from-flame-500 group-hover:to-flame-600 group-hover:shadow-red rtl:rotate-180"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
