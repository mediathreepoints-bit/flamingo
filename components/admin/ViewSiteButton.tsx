'use client';

import { Globe } from 'lucide-react';

// « Voir le site » : nouvel onglet si possible, sinon navigation courante
// (les popups peuvent être bloquées dans l'aperçu intégré).
export default function ViewSiteButton() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        const w = window.open('/', '_blank', 'noopener');
        if (!w) window.location.href = '/';
      }}
      className="rounded-lg border border-ink-500 bg-ink-800 px-4 py-2 text-xs font-bold uppercase tracking-mega text-steel-200 transition hover:border-flame-500/50 hover:text-white"
    >
      <Globe className="me-1.5 inline h-3.5 w-3.5" /> Voir le site
    </a>
  );
}
