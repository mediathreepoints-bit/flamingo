import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RealisationsGallery from '@/components/site/RealisationsGallery';
import { LiveRealisations } from '@/components/site/LiveSiteData';
import { PHP_MODE } from '@/lib/client-env';
import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS } from '@/lib/site';
import { getDict, isLocale } from '@/lib/i18n';
import { localeMetadata } from '@/lib/seo';
import type { GalleryItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localeMetadata(isLocale(locale) ? locale : 'fr', '/realisations', 'works');
}

export default async function RealisationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDict(raw);
  const s = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };
  const items = await repo.list<GalleryItem>('gallery');
  return PHP_MODE ? (
    <LiveRealisations items={items} whatsapp={s.whatsapp} t={t} locale={raw} />
  ) : (
    <RealisationsGallery items={items} whatsapp={s.whatsapp} t={t} locale={raw} />
  );
}
