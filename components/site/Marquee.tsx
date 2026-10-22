import { LOCALE_META, type Locale } from '@/lib/i18n';

/** Bandeau défilant des mots-clés prestations (style premium, défilement CSS). */
export default function Marquee({ items, locale }: { items: string[]; locale: Locale }) {
  const row = [...items, ...items];
  return (
    <div
      dir={LOCALE_META[locale].dir}
      className="relative overflow-hidden border-y border-white/5 bg-ink-900/80 py-3.5"
      aria-hidden
    >
      <div className="mask-edges flex w-max animate-marquee gap-10">
        {row.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10 text-xs font-bold uppercase tracking-mega text-steel-500">
            {item}
            <span className="h-1 w-1 rounded-full bg-flame-500/70" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-flame-500/40 to-transparent" />
    </div>
  );
}
