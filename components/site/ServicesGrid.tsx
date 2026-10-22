'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Hammer, SprayCan, Sparkles, Car } from 'lucide-react';
import { withLocale, type Dict, type Locale } from '@/lib/i18n';
import { SERVICE_IMAGES } from '@/lib/atelier';

const ICONS = [Hammer, SprayCan, Sparkles, Car];
const IMAGES = [
  SERVICE_IMAGES.carrosserie,
  SERVICE_IMAGES.peinture,
  SERVICE_IMAGES.polissage,
  SERVICE_IMAGES.renovation,
];
const ANCHORS = ['carrosserie', 'peinture', 'polissage', 'renovation'];

/** Cartes services : photo, icône, description courte, action claire — style verre premium. */
export default function ServicesGrid({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {t.servicesBlock.items.map((item, i) => {
        const Icon = ICONS[i];
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            className="group card-glass relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-flame-500/40"
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={IMAGES[i]}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/25 to-transparent" aria-hidden />
              <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-flame-500 to-flame-600 text-white shadow-red">
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-lg font-black uppercase leading-tight tracking-wide text-white">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-400">{item.desc}</p>
              <Link
                href={withLocale(locale, `/services#${ANCHORS[i]}`)}
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-mega text-flame-400 transition-colors hover:text-flame-500"
              >
                {t.common.learnMore}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
