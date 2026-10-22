import type { MetadataRoute } from 'next';
import { LOCALES, withLocale } from '@/lib/i18n';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const ROUTES = ['', '/services', '/realisations', '/a-propos', '/devis', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const r of ROUTES) {
      entries.push({
        url: `${base}${withLocale(locale, r || '/')}`,
        lastModified: new Date(),
        changeFrequency: r === '' ? 'weekly' : 'monthly',
        priority: locale === 'fr' ? (r === '' ? 1 : 0.7) : r === '' ? 0.8 : 0.5,
      });
    }
  }
  return entries;
}
