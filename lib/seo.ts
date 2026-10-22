import type { Metadata } from 'next';
import { LOCALES, getDict, withLocale, type Dict, type Locale } from './i18n';

/** Métadonnées par locale + alternates hreflang (fr sans préfixe, /en, /ar). */
export function localeMetadata(locale: Locale, path: string, key: keyof Dict['meta']): Metadata {
  const m = getDict(locale).meta[key];
  const languages: Record<string, string> = { 'x-default': path };
  for (const l of LOCALES) languages[l] = withLocale(l, path);
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical: withLocale(locale, path), languages },
    openGraph: { title: m.title, description: m.desc, url: withLocale(locale, path) },
  };
}
