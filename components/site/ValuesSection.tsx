'use client';

import { motion } from 'framer-motion';
import { Users, Settings, Gem, Handshake, Timer } from 'lucide-react';
import type { Dict } from '@/lib/i18n';

const ICONS = [Users, Gem, Settings, Timer, Handshake];

/** « NOS VALEURS, VOTRE SÉRÉNITÉ » — 4 colonnes séparées, icônes rouges (maquette). */
export default function ValuesSection({ t }: { t: Dict }) {
  return (
    <section className="relative bg-ink-900 py-24">
      <div className="pointer-events-none absolute left-0 top-1/3 h-72 w-72 rounded-full bg-flame-500/8 blur-[110px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-flame-500" /> {t.why.kicker}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            viewport={{ once: true }}
            className="font-display mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-4xl"
          >
            {t.why.title} <span className="text-brand-gradient">{t.why.accent}</span>
          </motion.h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-white/10 lg:rtl:divide-x-reverse">
          {t.why.items.map((v, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex flex-col items-center px-4 text-center lg:px-8"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-flame-500/25 bg-flame-500/8 text-flame-500 transition-all duration-300 group-hover:border-flame-500/60 group-hover:bg-flame-500/15">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="font-display mt-5 text-sm font-black uppercase leading-snug tracking-wide text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-400">{v.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
