'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { PhoneCall, Zap, FileText } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFab';
import { waLink } from '@/lib/site';
import type { Dict } from '@/lib/i18n';

/** Bande WhatsApp (maquette) : image téléphone à gauche, titre + texte au centre, bouton vert à droite, chips en dessous. */
export default function WhatsAppSection({
  whatsapp,
  phone,
  phoneRaw,
  image,
  t,
}: {
  whatsapp: string;
  phone: string;
  phoneRaw: string;
  instagram: string;
  instagramHandle: string;
  image: string;
  t: Dict;
}) {
  const chips = [
    { icon: Zap, label: t.wa.chips[0] },
    { icon: FileText, label: t.wa.chips[1] },
    { icon: PhoneCall, label: phone },
  ];

  return (
    <section id="whatsapp" className="relative overflow-hidden border-y border-white/5 bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#25D366]/8 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="card-glass overflow-hidden !rounded-2xl border-[#25D366]/20">
          <div className="grid items-center gap-8 lg:grid-cols-[280px_1fr_auto] lg:gap-12">
            {/* image téléphone (gauche) */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative hidden aspect-square lg:block"
            >
              <Image src={image} alt="WhatsApp — Flamingo Auto Kénitra" fill sizes="280px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink-900/60" aria-hidden />
            </motion.div>

            {/* titre + texte (centre) */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="px-6 pt-8 lg:px-0 lg:py-10"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/25 bg-[#25D366]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-[#25D366] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" /> {t.wa.kicker}
              </p>
              <h2 className="font-display mt-4 text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
                {t.wa.title}
              </h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-steel-300">{t.wa.text}</p>
            </motion.div>

            {/* bouton vert (droite) */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="px-6 pb-8 lg:pe-12 lg:ps-0"
            >
              <a
                href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-sm font-bold uppercase tracking-mega text-white transition hover:bg-[#1EBE5A] hover:shadow-[0_10px_44px_-8px_rgba(37,211,102,0.55)]"
              >
                <WhatsAppIcon className="h-4 w-4" /> {t.wa.chat}
              </a>
            </motion.div>
          </div>

          {/* chips (maquette) : Réponse rapide · Devis gratuit · téléphone */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 bg-ink-900/60 px-6 py-5 lg:px-10"
          >
            {chips.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2.5 text-sm font-bold text-white">
                <Icon className="h-4 w-4 text-flame-500" strokeWidth={2} /> {label}
              </span>
            ))}
            <a href={`tel:${phoneRaw}`} className="ms-auto text-xs font-bold uppercase tracking-mega text-flame-400 transition-colors hover:text-flame-500">
              {t.common.phone}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
