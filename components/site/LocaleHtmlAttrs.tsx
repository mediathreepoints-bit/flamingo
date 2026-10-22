'use client';

import { useEffect } from 'react';
import { LOCALE_META, type Locale } from '@/lib/i18n';

/** Synchronise <html lang> et dir (RTL pour l'arabe). */
export default function LocaleHtmlAttrs({ locale }: { locale: Locale }) {
  useEffect(() => {
    const meta = LOCALE_META[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
  }, [locale]);
  return null;
}
