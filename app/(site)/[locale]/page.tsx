import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Hero from '@/components/site/Hero';
import Marquee from '@/components/site/Marquee';
import ServicesGrid from '@/components/site/ServicesGrid';
import TransformationsSection from '@/components/site/TransformationsSection';
import AtelierGallery from '@/components/site/AtelierGallery';
import ValuesSection from '@/components/site/ValuesSection';
import ReopeningSection from '@/components/site/ReopeningSection';
import QuoteForm from '@/components/site/QuoteForm';
import WhatsAppSection from '@/components/site/WhatsAppSection';
import { LiveReopening, LiveServicesGrid, LiveTransformations } from '@/components/site/LiveSiteData';
import { PHP_MODE } from '@/lib/client-env';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS } from '@/lib/site';
import { getDict, isLocale } from '@/lib/i18n';
import { getServices8 } from '@/lib/services8';
import { activePromotion } from '@/lib/promo';
import type { Promotion } from '@/lib/types';
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
  const services8 = await getServices8(raw, t);
  let promo: Promotion | null = null;
  try {
    promo = activePromotion(await repo.list<Promotion>('promotions'));
  } catch {
    promo = null;
  }

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
          slogan: raw === 'fr' ? s.sloganFr : raw === 'ar' ? s.sloganAr : t.hero.slogan,
        }}
      />

      <Marquee items={t.marquee} locale={raw} />

      {/* ——— Services ——— */}
      <section id="services" className="relative bg-white py-24">
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mono-label flex items-center gap-3 text-flame-500">
                <span className="h-2 w-2 bg-flame-500" aria-hidden /> {t.servicesBlock.kicker}
              </p>
              <h2 className="font-display mt-4 text-4xl uppercase leading-[0.95] text-ink-950 md:text-6xl">
                {t.servicesBlock.title} <span className="text-flame-500">{t.servicesBlock.accent}</span>
              </h2>
            </div>
            <Link
              href={withLocale(raw, '/services')}
              className="mono-label inline-flex shrink-0 items-center gap-2 border-b border-flame-500 pb-1 text-ink-950 transition hover:text-flame-600"
            >
              {t.servicesBlock.seeAll} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          {PHP_MODE ? <LiveServicesGrid locale={raw} t={t} items={services8} /> : <ServicesGrid locale={raw} t={t} items={services8} />}
        </div>
      </section>

      {PHP_MODE ? <LiveTransformations items={gallery} whatsapp={s.whatsapp} t={t} /> : <TransformationsSection items={gallery} whatsapp={s.whatsapp} t={t} />}
      <AtelierGallery t={t} variant="strip" />
      {PHP_MODE ? <LiveReopening t={t} whatsapp={s.whatsapp} promo={promo} /> : <ReopeningSection t={t} whatsapp={s.whatsapp} promo={promo} />}
      <ValuesSection t={t} />

      {/* ——— Devis (template : « Parlez-nous de votre véhicule ») ——— */}
      <section id="devis" className="relative border-t border-white/10 bg-black py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="mono-label flex items-center gap-3 text-flame-500">
              <span className="h-2 w-2 bg-flame-500" aria-hidden /> {t.quotePage.kicker}
            </p>
            <h2 className="font-display mt-4 text-4xl uppercase leading-[0.95] text-white md:text-6xl">
              {t.quotePage.title} <span className="text-flame-500">{t.quotePage.accent}</span>
            </h2>
            <p className="mt-5 border-s-2 border-flame-500 ps-5 text-base leading-relaxed text-steel-400">{t.quotePage.intro}</p>
          </div>
          <div className="mt-10">
            <QuoteForm whatsapp={s.whatsapp} phone={s.phone} t={t} />
          </div>
        </div>
      </section>

      <WhatsAppSection
        whatsapp={s.whatsapp}
        phone={s.phone}
        phoneRaw={s.phoneRaw}
        instagram={s.instagram}
        instagramHandle={s.instagramHandle}
        image="/images/contact-template.jpg"
        t={t}
      />
    </>
  );
}
