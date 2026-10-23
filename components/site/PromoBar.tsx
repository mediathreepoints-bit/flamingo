import { Megaphone } from 'lucide-react';
import type { Dict } from '@/lib/i18n';
import type { Promotion } from '@/lib/types';

/**
 * Bande d'annonce du header — style « ticker » éditorial :
 * fond rouge signal, texte monospace encre.
 * - Avec campagne active confirmée : titre + remise de la campagne.
 * - Sinon : simple annonce de réouverture, SANS aucune remise active.
 */
export default function PromoBar({ t, promo }: { t: Dict; promo: Promotion | null }) {
  const note = promo && promo.services.length > 0 && promo.services.length < 8 ? t.reopen.badgeSome : t.reopen.badgeNote;
  return (
    <div className="relative bg-flame-500 text-ink-950">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-ink-950/30" aria-hidden />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-5 py-1.5 text-center lg:px-8">
        <Megaphone className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <p className="mono-label leading-tight !tracking-[0.14em]">
          {t.reopen.title}
          <span className="mx-2 opacity-60" aria-hidden>
            ▪
          </span>
          {promo ? (
            <span className="underline decoration-2 underline-offset-2">
              {promo.title} — -{promo.percent}% {note}
            </span>
          ) : (
            <span>{t.reopen.text}</span>
          )}
        </p>
      </div>
    </div>
  );
}
