import { LOCALE_META, type Locale } from '@/lib/i18n';

/** Bandeau défilant éditorial : bande encre, typo poster, séparateurs rouges. */
export default function Marquee({ items, locale }: { items: string[]; locale: Locale }) {
  const row = [...items, ...items];
  return (
    <div
      dir={LOCALE_META[locale].dir}
      className="relative overflow-hidden border-y border-white/10 bg-ink-950 py-3"
      aria-hidden
    >
      <div className="flex w-max animate-marquee gap-8">
        {row.map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-8 font-display text-sm uppercase tracking-[0.18em] text-white/85"
          >
            {item}
            <span className="h-1.5 w-1.5 bg-flame-500" />
          </span>
        ))}
      </div>
    </div>
  );
}
