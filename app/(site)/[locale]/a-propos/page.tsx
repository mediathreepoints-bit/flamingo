import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Hammer, SprayCan, Sparkles, Car, MapPin } from 'lucide-react';
import { WhatsAppIcon } from '@/components/site/WhatsAppFab';
import { InstagramIcon } from '@/components/site/Icons';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS, waLink } from '@/lib/site';
import { getDict, isLocale, withLocale } from '@/lib/i18n';
import { localeMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata(isLocale(locale) ? locale : 'fr', '/a-propos', 'about');
}

const ICONS = [Hammer, SprayCan, Sparkles, Car];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDict(raw);
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };

  return (
    <div className="bg-ink-950">
      <section className="relative overflow-hidden border-b border-white/5 pt-36 pb-20">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-flame-500" /> {t.about.kicker}
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-6xl">
            {t.about.title1} <span className="text-brand-gradient">{t.about.accent}</span>
          </h1>
          <p className={`mt-6 text-2xl text-flame-400 ${raw === 'ar' ? 'font-ar text-xl font-bold' : 'font-hand'}`}>{raw === 'fr' ? s.sloganFr : raw === 'ar' ? s.sloganAr : t.hero.slogan}</p>
          <p className={`mt-1 text-lg font-bold text-steel-300 ${raw === 'ar' ? 'font-hand text-xl' : 'font-ar slogan-ar'}`} lang={raw === 'ar' ? 'fr' : 'ar'} dir={raw === 'ar' ? 'ltr' : 'rtl'}>
            {raw === 'ar' ? s.sloganFr : s.sloganAr}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div className="card-glass relative aspect-[4/3] overflow-hidden !rounded-2xl">
          <Image src="/images/hero-garage-bg.jpg" alt="Atelier Flamingo Auto Kénitra" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 to-transparent" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t.about.title2} <span className="text-brand-gradient">{t.about.title2Accent}</span>
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-steel-400">
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {t.categories && Object.entries(t.categories).map(([key, label], i) => {
              const Icon = ICONS[i];
              return (
                <div key={key} className="card-glass p-4 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-flame-500/30 bg-flame-500/10 text-flame-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-mega text-steel-300">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-ink-900 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-3 lg:px-8">
          <div className="card-glass p-7">
            <MapPin className="h-6 w-6 text-flame-500" />
            <h3 className="font-display mt-4 text-lg font-black uppercase text-white">{t.about.zone.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-steel-400">{t.about.zone.text}</p>
            <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 hover:text-flame-500">
              {t.about.zone.maps} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          </div>
          <div className="card-glass p-7">
            <WhatsAppIcon className="h-6 w-6 text-[#25D366]" />
            <h3 className="font-display mt-4 text-lg font-black uppercase text-white">{t.about.direct.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-steel-400">{t.about.direct.text}</p>
            <a href={waLink(s.whatsapp, 'Bonjour Flamingo Auto Kénitra.')} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-mega text-[#25D366] hover:text-[#1EBE5A]">
              {s.phone} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          </div>
          <div className="card-glass p-7">
            <InstagramIcon className="h-6 w-6 text-flame-500" />
            <h3 className="font-display mt-4 text-lg font-black uppercase text-white">{t.about.social.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-steel-400">{t.about.social.text}</p>
            <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-mega text-flame-400 hover:text-flame-500">
              {s.instagramHandle} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-7xl px-5 text-center lg:px-8">
          <Link href={withLocale(raw, '/devis')} className="btn-primary !px-8 !py-4">
            {t.about.cta} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}
