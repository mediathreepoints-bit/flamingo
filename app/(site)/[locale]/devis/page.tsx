import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShieldCheck, Zap, Camera } from 'lucide-react';
import QuoteForm from '@/components/site/QuoteForm';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS } from '@/lib/site';
import { getDict, isLocale } from '@/lib/i18n';
import { localeMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata(isLocale(locale) ? locale : 'fr', '/devis', 'quote');
}

const STEP_ICONS = [Camera, Zap, ShieldCheck];

export default async function DevisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDict(raw);
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };

  return (
    <div className="bg-ink-950">
      <section className="relative overflow-hidden border-b border-white/5 pt-36 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-flame-500/10 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 text-center lg:px-8">
          <p className="mono-label inline-flex items-center gap-3 text-flame-500">
            <span className="h-2 w-2 bg-flame-500" /> {t.quotePage.kicker}
          </p>
          <h1 className="font-display mt-4 text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-6xl">
            {t.quotePage.title} <span className="text-flame-500">{t.quotePage.accent}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-steel-400">{t.quotePage.intro}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <QuoteForm whatsapp={s.whatsapp} phone={s.phoneRaw} t={t} />
        <aside className="space-y-5">
          {t.quotePage.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={step.title} className="card-glass flex gap-4 p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-flame-500/30 bg-flame-500/10 text-flame-500">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-sm font-black uppercase tracking-wide text-white">{step.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-steel-400">{step.text}</p>
                </div>
              </div>
            );
          })}
          <div className="card-glass p-6">
            <p className="text-[10px] font-bold uppercase tracking-mega text-steel-500">{t.quotePage.quick}</p>
            <a href={`tel:${s.phoneRaw}`} className="font-display mt-2 block text-2xl font-black text-white transition-colors hover:text-flame-400">{s.phone}</a>
            <p className="mt-1 text-xs text-steel-500">{t.common.cityValue}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
