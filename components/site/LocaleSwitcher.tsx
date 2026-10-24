'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { LOCALES, LOCALE_META, stripLocale, withLocale, type Locale } from '@/lib/i18n';
import { cx } from '@/lib/format';

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const base = stripLocale(pathname || '/');

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 backdrop-blur-md"
      role="group"
      aria-label="Choix de la langue"
    >
      <Globe className="mx-1.5 h-3.5 w-3.5 shrink-0 text-flame-500" aria-hidden />
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={withLocale(l, base)}
          lang={l}
          className={cx(
            'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all',
            l === locale ? 'bg-flame-500 text-white shadow-red' : 'text-steel-400 hover:bg-white/10 hover:text-white',
          )}
          aria-current={l === locale ? 'true' : undefined}
          title={LOCALE_META[l].label}
        >
          {LOCALE_META[l].short}
        </Link>
      ))}
    </div>
  );
}
