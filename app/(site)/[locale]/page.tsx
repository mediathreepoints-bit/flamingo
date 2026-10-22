import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Hero from '@/components/site/Hero';
import Marquee from '@/components/site/Marquee';
import ServicesGrid from '@/components/site/ServicesGrid';
import TransformationsSection from '@/components/site/TransformationsSection';
import AtelierGallery from '@/components/site/AtelierGallery';
import ValuesSection from '@/components/site/ValuesSection';
import WhatsAppSection from '@/components/site/WhatsAppSection';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS } from '@/lib/site';
import { getDict, isLocale } from '@/lib/i18n';
import { localeMetadata } from '@/lib/seo';
import { ArrowRight } from 'lucide-react';
import { withLocale } from '@/lib/i18n';
import type { GalleryItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata(isLocale(locale) ? locale : 'fr', '/', 'home');
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDict(raw);
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };
  const gallery = (await repo.list<GalleryItem>('gallery')).filter((g) => g.featured !== false);

  return (
    <>
      <Hero
        locale={raw}
        t={t}
        whatsapp={s.whatsapp}
        heroImage="/images/hero-garage-bg.jpg"
        settings={{
          heroEyebrow: s.heroEyebrow,
          heroTitle1: s.heroTitle1,
          heroTitle2: s.heroTitle2,
          heroSubtitle: s.heroSubtitle,
          sloganFr: s.sloganFr,
          sloganAr: s.sloganAr,
        }}
      />

      <Marquee items={t.marquee} locale={raw} />

      {/* ——— Services ——— */}
      <section id="services" className="relative bg-ink-900 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame-500/40 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-flame-500" /> {t.servicesBlock.kicker}
              </p>
              <h2 className="font-display mt-4 text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-5xl">
                {t.servicesBlock.title} <span className="text-brand-gradient">{t.servicesBlock.accent}</span>
              </h2>
            </div>
            <Link
              href={withLocale(raw, '/services')}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-mega text-white backdrop-blur-md transition hover:border-flame-500/60 hover:text-flame-400"
            >
              {t.servicesBlock.seeAll} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <ServicesGrid locale={raw} t={t} />
        </div>
      </section>

      <TransformationsSection items={gallery} whatsapp={s.whatsapp} t={t} />
      <AtelierGallery t={t} variant="strip" />
      <ValuesSection t={t} />
      <WhatsAppSection
        whatsapp={s.whatsapp}
        phone={s.phone}
        phoneRaw={s.phoneRaw}
        instagram={s.instagram}
        instagramHandle={s.instagramHandle}
        image="/images/whatsapp-hand.jpg"
        t={t}
      />
    </>
  );
}
