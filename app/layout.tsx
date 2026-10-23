import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@fontsource/anton/400.css';
import '@fontsource-variable/archivo';
import '@fontsource-variable/manrope';
import '@fontsource-variable/caveat';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/noto-sans-arabic';
import { OFFICIAL } from '@/lib/site';

const description =
  'FLAMINGO AUTO KÉNITRA — carrosserie, peinture au four, polissage et rénovation automobile à Kénitra, Maroc. ' +
  'Une nouvelle équipe, un nouvel élan. Devis et suivi de réparation sur WhatsApp.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'FLAMINGO AUTO KÉNITRA — Carrosserie, Peinture au four & Polissage',
    template: '%s | FLAMINGO AUTO KÉNITRA',
  },
  description,
  keywords: [
    'Carrosserie Kénitra',
    'Peinture au four Kénitra',
    'Polissage automobile Kénitra',
    'Rénovation automobile Kénitra',
    'réparation carrosserie Maroc',
    'garage Kénitra',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    siteName: OFFICIAL.brand + ' ' + OFFICIAL.city,
    title: 'FLAMINGO AUTO KÉNITRA — Carrosserie & Peinture au four',
    description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'FLAMINGO AUTO KÉNITRA' }],
  },
  twitter: { card: 'summary_large_image', title: 'FLAMINGO AUTO KÉNITRA', description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0B0C0E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <div id="portal" className="pointer-events-none fixed inset-0 z-[90]" aria-hidden />
      </body>
    </html>
  );
}
