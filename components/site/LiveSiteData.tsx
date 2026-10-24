'use client';

/** Variante export PHP : le HTML public est figé au build. Ces enveloppes
 *  rechargent au montage les données éditables depuis l'admin (galerie,
 *  promotion active, services) via GET /api/public/site-data, et rendent les
 *  MÊMES composants que le mode Node. En mode Node, PHP_MODE=false →
 *  aucun fetch, rendu identique aux données serveur. */

import { useEffect, useState } from 'react';
import { PHP_MODE, apiUrl } from '@/lib/client-env';
import { SERVICES8_META, type Service8 } from '@/lib/services-meta';
import type { Dict, Locale } from '@/lib/i18n';
import type { GalleryItem, Promotion, ServiceContent } from '@/lib/types';
import TransformationsSection from './TransformationsSection';
import ReopeningSection from './ReopeningSection';
import RealisationsGallery from './RealisationsGallery';
import ServicesGrid from './ServicesGrid';

interface SiteData {
  gallery: GalleryItem[];
  promotion: Promotion | null;
  services: ServiceContent[];
}

let cache: SiteData | null = null;
async function fetchSiteData(): Promise<SiteData | null> {
  if (!PHP_MODE) return null;
  if (cache) return cache;
  try {
    const r = await fetch(apiUrl('/api/public/site-data'), { cache: 'no-store' });
    if (!r.ok) return null;
    cache = (await r.json()) as SiteData;
    return cache;
  } catch {
    return null;
  }
}

export function LiveTransformations({ items, whatsapp, t }: { items: GalleryItem[]; whatsapp: string; t: Dict }) {
  const [data, setData] = useState<GalleryItem[]>(items);
  useEffect(() => {
    fetchSiteData().then((d) => { if (d) setData(d.gallery.filter((g) => g.featured !== false)); });
  }, []);
  return <TransformationsSection items={data} whatsapp={whatsapp} t={t} />;
}

export function LiveReopening({ t, whatsapp, promo }: { t: Dict; whatsapp: string; promo: Promotion | null }) {
  const [p, setP] = useState<Promotion | null>(promo);
  useEffect(() => {
    fetchSiteData().then((d) => { if (d) setP(d.promotion); });
  }, []);
  return <ReopeningSection t={t} whatsapp={whatsapp} promo={p} />;
}

export function LiveRealisations({ items, whatsapp, t, locale }: { items: GalleryItem[]; whatsapp: string; t: Dict; locale: Locale }) {
  const [data, setData] = useState<GalleryItem[]>(items);
  useEffect(() => {
    fetchSiteData().then((d) => { if (d) setData(d.gallery); });
  }, []);
  return <RealisationsGallery items={data} whatsapp={whatsapp} t={t} locale={locale} />;
}

export function LiveServicesGrid({ locale, t, items }: { locale: Locale; t: Dict; items: Service8[] }) {
  const [rows, setRows] = useState<Service8[]>(items);
  useEffect(() => {
    fetchSiteData().then((d) => {
      if (!d) return;
      // même fusion que getServices8() côté serveur : surcharges admin > défauts i18n
      const merged = SERVICES8_META.map((m, i) => {
        const ov = d.services.find((o) => o.id === m.id);
        const loc = ov ? (ov as unknown as Record<string, { title?: string; desc?: string; sub?: string } | undefined>)[locale] : undefined;
        return {
          id: m.id,
          icon: m.icon,
          image: ov?.image || m.image,
          title: loc?.title || items[i]?.title || t.services8.items[i]?.title || '',
          desc: loc?.desc || items[i]?.desc || t.services8.items[i]?.desc || '',
          sub: loc?.sub || items[i]?.sub || t.services8.items[i]?.sub || '',
        };
      });
      setRows(merged);
    });
  }, [locale, items, t]);
  return <ServicesGrid locale={locale} t={t} items={rows} />;
}
