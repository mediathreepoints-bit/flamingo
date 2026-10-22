import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Hammer, SprayCan, Sparkles, Car } from 'lucide-react';
import HeroSlides from '@/components/site/HeroSlides';
import { WhatsAppIcon } from '@/components/site/WhatsAppFab';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS, waLink } from '@/lib/site';
import { getDict, isLocale, withLocale } from '@/lib/i18n';
import { localeMetadata } from '@/lib/seo';
import { SERVICE_IMAGES } from '@/lib/atelier';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata(isLocale(locale) ? locale : 'fr', '/services', 'services');
}

const ICONS = [Hammer, SprayCan, Sparkles, Car];
const IMAGES = [
  SERVICE_IMAGES.carrosserie,
  SERVICE_IMAGES.peinture,
  SERVICE_IMAGES.polissage,
  SERVICE_IMAGES.renovation,
];
const IDS = ['carrosserie', 'peinture', 'polissage', 'renovation'];
const ALTS = [
  'Chantier de carrosserie : masquage d’un véhicule avant traitement',
  'Cabine de peinture Flamingo Auto, cuisson en cours',
  'Finition livrée : Clio blanche brillante',
  'Hall de l’atelier Flamingo Auto Kénitra, véhicule en rénovation',
];

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDict(raw);
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };

  return (
    <div className="bg-ink-950">
      {/* en-tête */}
      <section className="relative overflow-hidden border-b border-white/5 pt-36 pb-20">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[120px]" aria-hidden />
        <HeroSlides
          items={[
            { src: IMAGES[0], label: t.servicesPage.sections[0].title },
            { src: IMAGES[1], label: t.servicesPage.sections[1].title },
            { src: IMAGES[2], label: t.servicesPage.sections[2].title },
            { src: IMAGES[3], label: t.servicesPage.sections[3].title },
          ]}
          className="absolute bottom-8 end-8 hidden w-[38%] max-w-lg lg:block"
        />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-flame-500" /> {t.servicesPage.kicker}
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-6xl">
            {t.servicesPage.title} <span className="text-brand-gradient">{t.servicesPage.accent}</span> {t.servicesPage.titleSuffix}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-steel-400">{t.servicesPage.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={withLocale(raw, '/devis')} className="btn-primary !px-6 !py-3.5">
              {t.common.freeQuote} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <a href={waLink(s.whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')} target="_blank" rel="noopener noreferrer" className="btn-ghost !border-white/15 !bg-white/5 backdrop-blur-md">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> {t.common.whatsapp}
            </a>
          </div>
        </div>
      </section>

      {/* détail des services */}
      {t.servicesPage.sections.map((sec, i) => {
        const Icon = ICONS[i];
        return (
          <section key={IDS[i]} id={IDS[i]} className={`border-b border-white/5 py-20 ${i % 2 ? 'bg-ink-900' : 'bg-ink-950'}`}>
            <div className={`mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <div className="card-glass relative aspect-[4/3] overflow-hidden !rounded-2xl">
                <Image src={IMAGES[i]} alt={ALTS[i]} fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/45 to-transparent" aria-hidden />
                <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-flame-500 to-flame-600 text-white shadow-red">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-4xl">{sec.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-steel-400">{sec.text}</p>
                <ul className="mt-6 space-y-3">
                  {sec.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-steel-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-flame-500 shadow-[0_0_8px_rgba(240,68,56,0.8)]" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href={withLocale(raw, '/devis')} className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-mega text-flame-400 transition-colors hover:text-flame-500">
                  {t.servicesPage.cta} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
