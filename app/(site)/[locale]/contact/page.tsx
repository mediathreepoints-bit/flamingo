import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PhoneCall, MapPin } from 'lucide-react';
import ContactForm from '@/components/site/ContactForm';
import { WhatsAppIcon } from '@/components/site/WhatsAppFab';
import { InstagramIcon } from '@/components/site/Icons';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS, waLink } from '@/lib/site';
import { getDict, isLocale } from '@/lib/i18n';
import { localeMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata(isLocale(locale) ? locale : 'fr', '/contact', 'contact');
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDict(raw);
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };

  return (
    <div className="bg-ink-950">
      <section className="relative overflow-hidden border-b border-white/5 pt-36 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <p className="mono-label inline-flex items-center gap-3 text-flame-500">
            <span className="h-2 w-2 bg-flame-500" /> {t.contactPage.kicker}
          </p>
          <h1 className="font-display mt-4 text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-6xl">
            {t.contactPage.title} <span className="text-flame-500">{t.contactPage.accent}</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <aside className="space-y-5">
          <a href={`tel:${s.phoneRaw}`} className="card-glass flex items-center gap-4 p-6 transition-colors hover:border-flame-500/40">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-flame-500 to-flame-600 text-white shadow-red"><PhoneCall className="h-5 w-5" /></span>
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-mega text-steel-500">{t.common.phone}</span>
              <span className="font-display mt-0.5 block text-xl font-black text-white">{s.phone}</span>
            </span>
          </a>
          <a href={waLink(s.whatsapp, 'Bonjour Flamingo Auto Kénitra.')} target="_blank" rel="noopener noreferrer" className="card-glass flex items-center gap-4 border-[#25D366]/25 bg-[#25D366]/5 p-6 transition-colors hover:border-[#25D366]/50">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white"><WhatsAppIcon className="h-5 w-5" /></span>
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-mega text-steel-500">{t.common.whatsappLabel}</span>
              <span className="font-display mt-0.5 block text-xl font-black text-white">{s.phone}</span>
            </span>
          </a>
          <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="card-glass flex items-center gap-4 p-6 transition-colors hover:border-flame-500/40">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-flame-500/30 bg-flame-500/10 text-flame-500"><InstagramIcon className="h-5 w-5" /></span>
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-mega text-steel-500">{t.common.instagram}</span>
              <span className="font-display mt-0.5 block text-xl font-black text-white">{s.instagramHandle}</span>
            </span>
          </a>
          <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" className="card-glass flex items-center gap-4 p-6 transition-colors hover:border-flame-500/40">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"><MapPin className="h-5 w-5 text-flame-500" /></span>
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-mega text-steel-500">{t.contactPage.zone}</span>
              <span className="font-display mt-0.5 block text-xl font-black text-white">{t.common.cityValue}</span>
            </span>
          </a>
          <div className="card-glass overflow-hidden !rounded-xl">
            <iframe
              title={t.contactPage.mapTitle}
              src={s.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-56 w-full grayscale-[0.3] contrast-[1.05]"
            />
          </div>
        </aside>
        <ContactForm t={t} />
      </section>
    </div>
  );
}
