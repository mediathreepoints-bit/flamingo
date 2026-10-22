import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Hammer, SprayCan, Sparkles, Car, Users, Gem, Settings, Timer, Handshake, Flame, Wrench, GlassWater, Package, Armchair } from 'lucide-react';
import HeroSlides from '@/components/site/HeroSlides';
import { WhatsAppIcon } from '@/components/site/WhatsAppFab';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS, waLink } from '@/lib/site';
import { getDict, isLocale, withLocale } from '@/lib/i18n';
import { localeMetadata } from '@/lib/seo';
import { getServices8, SERVICES8_META } from '@/lib/services8';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata(isLocale(locale) ? locale : 'fr', '/services', 'services');
}

const ICON_MAP: Record<string, typeof Car> = { Car, SprayCan, Sparkles, Flame, GlassWater, Package, Armchair, Wrench };
const ENG_ICONS = [Users, Gem, Settings, Timer, Handshake];
const LEGACY_ICONS = [Hammer, SprayCan, Sparkles, Car];

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDict(raw);
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };
  const services = await getServices8(raw, t);

  return (
    <div className="bg-ink-950">
      {/* en-tête */}
      <section className="relative overflow-hidden border-b border-white/5 pt-40 pb-20">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[120px]" aria-hidden />
        <HeroSlides
          items={services.slice(0, 4).map((sv) => ({ src: sv.image, label: sv.title }))}
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

      {/* ——— engagements (affiche officielle) ——— */}
      <section className="border-b border-white/5 bg-ink-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-10 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-white/10 lg:rtl:divide-x-reverse lg:px-8">
          {t.engagements.map((label, i) => {
            const Icon = ENG_ICONS[i];
            return (
              <div key={label} className="flex flex-col items-center gap-3 px-4 text-center">
                <Icon className="h-6 w-6 text-flame-500" strokeWidth={1.8} aria-hidden />
                <p className="text-[11px] font-black uppercase leading-snug tracking-mega text-steel-200">{label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ——— 8 prestations détaillées ——— */}
      {services.map((sv, i) => {
        const Icon = ICON_MAP[sv.icon] || LEGACY_ICONS[i % 4];
        return (
          <section key={sv.id} id={sv.id} className={`border-b border-white/5 py-20 ${i % 2 ? 'bg-ink-900' : 'bg-ink-950'}`}>
            <div className={`mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <div className="card-glass relative aspect-[4/3] overflow-hidden !rounded-2xl">
                <Image src={sv.image} alt={sv.title} fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/45 to-transparent" aria-hidden />
                <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-flame-500 to-flame-600 text-white shadow-red">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-mega text-flame-500">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="font-display mt-2 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">{sv.title}</h2>
                {sv.sub && (
                  <p
                    className={`mt-1 text-sm font-bold text-flame-400/90 ${raw === 'ar' ? '' : 'font-ar'}`}
                    lang={raw === 'ar' ? 'fr' : 'ar'}
                    dir={raw === 'ar' ? 'ltr' : 'rtl'}
                  >
                    {sv.sub}
                  </p>
                )}
                <p className="mt-4 text-base leading-relaxed text-steel-400">{sv.desc}</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href={withLocale(raw, '/devis')} className="btn-primary !px-5 !py-3">
                    {t.common.freeQuote} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                  <a
                    href={waLink(s.whatsapp, `Bonjour Flamingo Auto Kénitra, je souhaite un devis : ${sv.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost !border-white/15 !bg-white/5 backdrop-blur-md"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> {t.common.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
