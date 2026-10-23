'use client';

import { motion } from 'framer-motion';
import { CalendarDays, FileText } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFab';
import { waLink } from '@/lib/site';
import type { Dict } from '@/lib/i18n';
import type { Promotion } from '@/lib/types';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * « GRANDE RÉOUVERTURE » — bande rouge signal plein cadre :
 * titrage poster encre, statut d'offre gouverné par l'admin, tampon carré rotatif.
 */
export default function ReopeningSection({ t, whatsapp, promo }: { t: Dict; whatsapp: string; promo: Promotion | null }) {
  const note = promo && promo.services.length > 0 && promo.services.length < 8 ? t.reopen.badgeSome : t.reopen.badgeNote;

  return (
    <section className="relative overflow-hidden bg-flame-500 py-24 text-ink-950">
      {/* mot fantôme en contour */}
      <span
        className="pointer-events-none absolute -top-6 start-0 select-none whitespace-nowrap font-display text-[16vw] uppercase leading-none text-transparent opacity-[0.12]"
        style={{ WebkitTextStroke: '2px #0B0C0E' }}
        aria-hidden
      >
        {t.reopen.brand}
      </span>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_auto]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mono-label inline-block bg-ink-950 px-3 py-1.5 text-paper"
            >
              {t.reopen.kicker}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              viewport={{ once: true }}
              className="font-display mt-5 text-5xl uppercase leading-[0.92] md:text-7xl"
            >
              {t.reopen.title}
              <span className="mt-1 block text-outline-ink">{t.reopen.brand}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-6 max-w-xl border-s-2 border-ink-950 ps-5 text-base font-medium leading-relaxed text-ink-950/85 md:text-lg"
            >
              {t.reopen.text}
            </motion.p>

            {/* conditions / statut de l'offre (gating admin) */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="mt-7 space-y-2">
              {promo ? (
                <>
                  <p className="mono-label flex items-center gap-2 !tracking-[0.14em] text-ink-950">
                    <CalendarDays className="h-4 w-4" aria-hidden />
                    {t.reopen.activeLabel}
                    {promo.start && promo.end ? ` · ${fmt(promo.start)} → ${fmt(promo.end)}` : ''}
                  </p>
                  {promo.terms && (
                    <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-950/75">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span>
                        <span className="mono-label !text-[10px]">{t.reopen.termsLabel}</span> {promo.terms}
                      </span>
                    </p>
                  )}
                </>
              ) : (
                <p className="flex items-start gap-2 text-xs font-medium leading-relaxed text-ink-950/75">
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
              className="mono-label mt-9 inline-flex items-center justify-center gap-2.5 bg-ink-950 px-7 py-4 text-paper transition hover:bg-white hover:text-ink-950"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> {t.reopen.cta}
            </motion.a>
          </div>

          {/* tampon carré */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 90 }}
            viewport={{ once: true }}
            className="justify-self-center lg:justify-self-end"
          >
            <div
              className={
                promo
                  ? 'relative flex h-56 w-56 flex-col items-center justify-center border-4 border-ink-950 bg-paper text-ink-950 shadow-[10px_10px_0_rgba(11,12,14,0.35)] md:h-64 md:w-64'
                  : 'relative flex h-56 w-56 flex-col items-center justify-center border-2 border-dashed border-ink-950/60 text-ink-950/85 md:h-64 md:w-64'
              }
            >
              <span className="mono-label !text-[10px] opacity-90">{promo ? t.reopen.activeLabel : t.reopen.kicker}</span>
              <span className="font-display mt-2 text-6xl leading-none md:text-7xl">{promo ? `-${promo.percent}%` : t.reopen.badge}</span>
              <span className="mono-label mt-3 max-w-[80%] text-center !text-[9px] !tracking-[0.14em] opacity-80">{note}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
