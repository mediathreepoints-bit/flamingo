'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { PhoneCall } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFab';
import { InstagramIcon } from './Icons';
import { waLink } from '@/lib/site';
import type { Dict } from '@/lib/i18n';

export default function WhatsAppSection({
  whatsapp,
  phone,
  phoneRaw,
  instagram,
  instagramHandle,
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
  return (
    <section id="whatsapp" className="relative overflow-hidden border-y border-white/5 bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#25D366]/8 to-transparent" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/25 bg-[#25D366]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-[#25D366] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" /> {t.wa.kicker}
          </p>
          <h2 className="font-display mt-4 text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-5xl">
            {t.wa.title} <span className="text-[#25D366]">{t.wa.accent}</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-steel-400">{t.wa.text}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3.5 text-sm font-bold uppercase tracking-mega text-white transition hover:bg-[#1EBE5A] hover:shadow-[0_10px_44px_-8px_rgba(37,211,102,0.55)]"
            >
              <WhatsAppIcon className="h-4 w-4" /> {t.wa.chat}
            </a>
            <a href={`tel:${phoneRaw}`} className="btn-ghost !border-white/15 !bg-white/5 backdrop-blur-md">
              <PhoneCall className="h-4 w-4 text-flame-500" /> {phone}
            </a>
          </div>

          <div className="mt-8 flex divide-x divide-white/10 border-t border-white/5 pt-6 rtl:divide-x-reverse">
            <div className="pe-8">
              <p className="text-[10px] font-bold uppercase tracking-mega text-steel-500">{t.common.whatsappLabel}</p>
              <p className="mt-1 text-sm font-bold text-white">{phone}</p>
            </div>
            <div className="px-8">
              <p className="text-[10px] font-bold uppercase tracking-mega text-steel-500">{t.common.instagram}</p>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-flame-400">
                <InstagramIcon className="h-3.5 w-3.5 text-flame-500" /> {instagramHandle}
              </a>
            </div>
            <div className="ps-8">
              <p className="text-[10px] font-bold uppercase tracking-mega text-steel-500">{t.common.city}</p>
              <p className="mt-1 text-sm font-bold text-white">{t.common.cityValue}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="card-glass relative aspect-[4/3] overflow-hidden !rounded-2xl">
            <Image src={image} alt="WhatsApp — Flamingo Auto Kénitra" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" aria-hidden />
          </div>
          <div className="absolute -bottom-5 start-6 rounded-xl border border-[#25D366]/30 bg-ink-800/90 px-5 py-4 shadow-card backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-mega text-[#25D366]">{t.wa.respLabel}</p>
            <p className="font-display text-lg font-black text-white">{t.wa.respText}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
