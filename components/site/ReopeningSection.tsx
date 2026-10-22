'use client';

import { motion } from 'framer-motion';
import { PartyPopper, CalendarDays, FileText } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFab';
import { waLink } from '@/lib/site';
import type { Dict } from '@/lib/i18n';
import type { Promotion } from '@/lib/types';

/**
 * Bannière « GRANDE RÉOUVERTURE ».
 * La remise n'est présentée comme en cours QUE si une campagne active
 * (confirmée par l'administrateur, dans ses dates) existe ; sinon le badge
 * reste en annonce « à venir », sans jamais affirmer une offre active.
 */
export default function ReopeningSection({ t, whatsapp, promo }: { t: Dict; whatsapp: string; promo: Promotion | null }) {
  const fmt = (d: string) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

  return (
    <section id="reouverture" className="relative overflow-hidden border-y border-white/5 bg-ink-950 py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" aria-hidden />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-[40rem] rounded-full bg-flame-500/12 blur-[130px]" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-flame-500/8 blur-[100px]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="card-glass relative overflow-hidden !rounded-3xl border-flame-500/20">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame-500/70 to-transparent" aria-hidden />
          <div className="grid items-center gap-10 px-8 py-12 lg:grid-cols-[1fr_auto] lg:px-14 lg:py-16">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full border border-flame-500/30 bg-flame-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 backdrop-blur-md"
              >
                <PartyPopper className="h-3.5 w-3.5" aria-hidden /> {t.reopen.kicker}
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                viewport={{ once: true }}
                className="font-display mt-5 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white md:text-6xl"
              >
                {t.reopen.title}
                <span className="text-brand-gradient mt-1 block">{t.reopen.brand}</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="mt-5 max-w-xl text-base leading-relaxed text-steel-300 md:text-lg"
              >
                {t.reopen.text}
              </motion.p>

              {/* conditions / statut de l'offre */}
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="mt-6 space-y-2">
                {promo ? (
                  <>
                    <p className="flex items-center gap-2 text-sm font-bold text-[#25D366]">
                      <CalendarDays className="h-4 w-4" aria-hidden />
                      {t.reopen.activeLabel}
                      {promo.start && promo.end ? ` · ${fmt(promo.start)} → ${fmt(promo.end)}` : ''}
                    </p>
                    {promo.terms && (
                      <p className="flex items-start gap-2 text-xs leading-relaxed text-steel-400">
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>
                          <span className="font-bold uppercase tracking-mega text-steel-300">{t.reopen.termsLabel}</span> {promo.terms}
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-steel-400">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {t.reopen.inactive}
                  </p>
                )}
              </motion.div>

              <motion.a
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                viewport={{ once: true }}
                href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je profite de la grande réouverture pour demander un devis.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-sm font-bold uppercase tracking-mega text-white transition hover:bg-[#1EBE5A] hover:shadow-[0_10px_44px_-8px_rgba(37,211,102,0.55)]"
              >
                <WhatsAppIcon className="h-4 w-4" /> {t.reopen.cta}
              </motion.a>
            </div>

            {/* badge promotionnel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 90 }}
              viewport={{ once: true }}
              className="justify-self-center lg:justify-self-end"
            >
              <div
                className={
                  promo
                    ? 'relative flex h-52 w-52 flex-col items-center justify-center rounded-full bg-gradient-to-b from-flame-500 to-flame-700 text-white shadow-red md:h-64 md:w-64'
                    : 'relative flex h-52 w-52 flex-col items-center justify-center rounded-full border-2 border-dashed border-flame-500/50 bg-flame-500/5 text-white/80 md:h-64 md:w-64'
                }
              >
                <span className="text-[10px] font-black uppercase tracking-mega opacity-90">{promo ? t.reopen.activeLabel : t.reopen.kicker}</span>
                <span className="font-display mt-1 text-5xl font-black leading-none md:text-6xl">{promo ? `-${promo.percent}%` : t.reopen.badge}</span>
                <span className="mt-2 max-w-[80%] text-center text-[10px] font-bold uppercase leading-tight tracking-wider opacity-80">{t.reopen.badgeNote}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
