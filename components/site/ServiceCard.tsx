'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface ServiceCardData {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  image: string;
  delay?: number;
}

/** Carte service éditoriale : cadre vif, photo N&B colorée au survol, index rouge. */
export default function ServiceCard({ icon: Icon, title, desc, href, image, delay = 0 }: ServiceCardData) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="group relative flex flex-col border border-white/10 bg-ink-900 transition-colors hover:border-flame-500/60"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" aria-hidden />
        <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center bg-flame-500 text-white">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg uppercase leading-tight tracking-wide text-white">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-400">{desc}</p>
        <Link
          href={href}
          className="mono-label mt-5 inline-flex items-center gap-2 text-flame-400 transition-colors group-hover:text-flame-500"
        >
          En savoir plus
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
        </Link>
      </div>
    </motion.div>
  );
}
