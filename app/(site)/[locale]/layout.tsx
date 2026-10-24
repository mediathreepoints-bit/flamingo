import { notFound } from 'next/navigation';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import WhatsAppAgent from '@/components/site/WhatsAppAgent';
import LocaleHtmlAttrs from '@/components/site/LocaleHtmlAttrs';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS } from '@/lib/site';
import { getDict, isLocale, LOCALE_META } from '@/lib/i18n';
import { activePromotion } from '@/lib/promo';
import type { Promotion } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDict(raw);
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };
  const dir = LOCALE_META[raw].dir;
  let promo: Promotion | null = null;
  try {
    promo = activePromotion(await repo.list<Promotion>('promotions'));
  } catch {
    promo = null;
  }

  return (
    <div dir={dir} className="relative min-h-screen bg-ink text-steel-200">
      <LocaleHtmlAttrs locale={raw} />
      <div className="pointer-events-none fixed inset-0 z-[60] noise opacity-[0.03]" aria-hidden />
      <Header
        locale={raw}
        t={t}
        brand={s.brand}
        city={s.city}
        phone={s.phone}
        phoneRaw={s.phoneRaw}
        whatsapp={s.whatsapp}
        promo={promo}
      />
      <main>{children}</main>
      <Footer
        locale={raw}
        t={t}
        brand={s.brand}
        city={s.city}
        phone={s.phone}
        phoneRaw={s.phoneRaw}
        whatsapp={s.whatsapp}
        instagram={s.instagram}
        instagramHandle={s.instagramHandle}
        mapUrl={s.mapUrl}
        legal={s.legal}
      />
      <WhatsAppAgent
        locale={raw}
        t={t}
        whatsapp={s.whatsapp}
        phone={s.phone}
        phoneRaw={s.phoneRaw}
        promo={promo}
        services={t.services8.items.map((i) => i.title)}
      />
    </div>
  );
}
