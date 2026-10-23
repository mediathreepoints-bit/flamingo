'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { PhoneCall, Zap, FileText } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFab';
import { waLink } from '@/lib/site';
import type { Dict } from '@/lib/i18n';

/**
 * Bande contact éditoriale : split encre — titrage poster + preuves monospaces
 * à gauche, photo N&B et actions bloc à droite.
 */
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
    <section id="whatsapp" className="relative border-y border-white/10 bg-ink-950">
      <div className="grid lg:grid-cols-2">
        {/* colonne texte */}
        <div className="flex flex-col justify-center px-5 py-16 lg:px-14 lg:py-24">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mono-label flex items-center gap-3 text-[#25D366]"
          >
            <span className="h-2 w-2 bg-[#25D366]" aria-hidden /> {t.wa.kicker}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            viewport={{ once: true }}
            className="font-display mt-5 text-4xl uppercase leading-[0.95] text-white md:text-6xl"
          >
            {t.wa.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-5 max-w-md border-s-2 border-flame-500 ps-5 text-base leading-relaxed text-steel-300"
          >
            {t.wa.text}
          </motion.p>

          {/* preuves : rangée hairline */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            viewport={{ once: true }}
            className="mt-9 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3"
          >
            {chips.map((c) => (
              <span key={c.label} className="flex items-center gap-2.5 bg-ink-950 px-4 py-3.5">
                <c.icon className="h-4 w-4 shrink-0 text-flame-500" strokeWidth={2} aria-hidden />
                <span className="mono-label !text-[10px] text-white">{c.label}</span>
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <a
              href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, j’ai une question sur mon véhicule.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label inline-flex items-center gap-2.5 bg-[#25D366] px-7 py-4 text-white transition hover:bg-white hover:text-ink-950"
            >
              <WhatsAppIcon className="h-4 w-4" /> {t.wa.chat}
            </a>
            <a
              href={`tel:${phoneRaw}`}
              className="mono-label inline-flex items-center gap-2.5 border border-white/25 px-7 py-4 text-white transition hover:border-flame-500 hover:text-flame-400"
            >
              <PhoneCall className="h-4 w-4 text-flame-500" /> {phone}
            </a>
          </motion.div>
        </div>

        {/* colonne photo */}
        <div className="relative min-h-[320px] border-t border-white/10 lg:min-h-0 lg:border-s lg:border-t-0">
          <Image src={image} alt={t.wa.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover grayscale contrast-125 transition-[filter] duration-700 hover:grayscale-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/30" aria-hidden />
          <span className="mono-label absolute bottom-4 start-5 bg-ink-950/85 px-3 py-1.5 text-flame-500" aria-hidden>
            WhatsApp · {phone}
          </span>
        </div>
      </div>
    </section>
  );
}
