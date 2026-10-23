'use client';

import { motion } from 'framer-motion';
import { Users, Settings, Gem, Handshake, Timer } from 'lucide-react';
import type { Dict } from '@/lib/i18n';

const ICONS = [Users, Gem, Settings, Timer, Handshake];

/** « NOS VALEURS, VOTRE SÉRÉNITÉ » — section ivoire : colonnes numérotées séparées par hairlines. */
export default function ValuesSection({ t }: { t: Dict }) {
  return (
    <section className="section-paper relative border-t border-ink-950/10 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mono-label flex items-center gap-3 text-flame-600"
            >
              <span className="h-2 w-2 bg-flame-500" aria-hidden /> {t.why.kicker}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              viewport={{ once: true }}
              className="font-display mt-4 text-4xl uppercase leading-[0.95] text-ink-950 md:text-6xl"
            >
              {t.why.title} <span className="text-flame-600">{t.why.accent}</span>
            </motion.h2>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px border border-ink-950/15 bg-ink-950/15 sm:grid-cols-2 lg:grid-cols-5">
          {t.why.items.map((v, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex flex-col bg-paper p-6 transition-colors hover:bg-white"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-4xl leading-none text-outline-ink" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Icon className="h-5 w-5 text-flame-600" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="font-display mt-6 text-sm uppercase leading-snug tracking-wide text-ink-950">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-950/70">{v.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
