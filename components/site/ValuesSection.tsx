'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, MessagesSquare, BadgeCheck } from 'lucide-react';
import type { Dict } from '@/lib/i18n';

const ICONS = [ShieldCheck, Sparkles, MessagesSquare, BadgeCheck];

export default function ValuesSection({ t }: { t: Dict }) {
  return (
    <section className="relative bg-ink-900 py-24">
      <div className="pointer-events-none absolute left-0 top-1/3 h-72 w-72 rounded-full bg-flame-500/8 blur-[110px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-center text-3xl font-black uppercase tracking-tight text-white md:text-4xl"
        >
          {t.why.title} <span className="text-brand-gradient">{t.why.accent}</span>
        </motion.h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.items.map((v, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group card-glass relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:border-flame-500/40"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-flame-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-flame-500/30 bg-flame-500/10 text-flame-500 transition-colors group-hover:bg-gradient-to-b group-hover:from-flame-500 group-hover:to-flame-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-5 text-base font-black uppercase tracking-wide text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-400">{v.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
