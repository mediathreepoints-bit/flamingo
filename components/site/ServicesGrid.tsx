'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { withLocale, type Dict, type Locale } from '@/lib/i18n';
import type { Service8 } from '@/lib/services-meta';

/**
 * Liste éditoriale des 8 prestations : lignes indexées séparées par hairlines,
 * titre poster, aperçu N&B qui se colore au survol, flèche signal.
 */
export default function ServicesGrid({ locale, t, items }: { locale: Locale; t: Dict; items: Service8[] }) {
  return (
    <div className="mt-12 border-t border-white/10">
      {items.map((sv, i) => (
        <motion.div
          key={sv.id}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: (i % 4) * 0.06, ease: 'easeOut' }}
        >
          <Link
            href={withLocale(locale, `/services#${sv.id}`)}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-white/10 px-2 py-5 transition-colors hover:bg-white/[0.04] md:grid-cols-[72px_1.05fr_1fr_auto] md:gap-8 md:py-6"
          >
            <span className="mono-label text-flame-500" aria-hidden>
              {String(i + 1).padStart(2, '0')}
            </span>

            <span className="min-w-0">
              <span className="font-display block text-xl uppercase leading-tight text-white transition-colors group-hover:text-flame-400 md:text-3xl">
                {sv.title}
              </span>
              {sv.sub && (
                <span
                  className={`mt-1 block text-[11px] font-bold text-steel-500 ${locale === 'ar' ? '' : 'font-ar'}`}
                  lang={locale === 'ar' ? 'fr' : 'ar'}
                  dir={locale === 'ar' ? 'ltr' : 'rtl'}
                >
                  {sv.sub}
                </span>
              )}
            </span>

            <span className="hidden text-sm leading-relaxed text-steel-400 md:block">{sv.desc}</span>

            <span className="flex items-center gap-4">
              <span className="relative hidden h-16 w-24 shrink-0 overflow-hidden border border-white/15 sm:block">
                <Image
                  src={sv.image}
                  alt={sv.title}
                  fill
                  sizes="96px"
                  className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                />
              </span>
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 text-white transition-all duration-300 group-hover:border-flame-500 group-hover:bg-flame-500 group-hover:text-white rtl:rotate-180"
                aria-label={t.common.freeQuote}
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
