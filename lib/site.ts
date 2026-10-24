/**
 * FLAMINGO AUTO KÉNITRA — informations officielles (source : fiche entreprise).
 * Tout est surchargeable depuis l'admin (« Contenu du site ») : ces valeurs
 * servent de défaut et de repli si la base est indisponible.
 */
export const OFFICIAL = {
  brand: 'FLAMINGO AUTO',
  city: 'KÉNITRA',
  cityLabel: 'Kénitra, Maroc',
  phone: '0661 50 86 74',
  phoneRaw: '+212661508674',
  whatsapp: '212661508674',
  instagram: 'https://www.instagram.com/flamingo_auto_kenitra/',
  instagramHandle: '@flamingo_auto_kenitra',
  sloganFr: 'Votre confiance, notre responsabilité.',
  sloganAr: 'ثقتكم مسؤوليتنا',
  heroEyebrow: 'Votre carrossier de confiance à Kénitra',
  heroTitle1: 'UNE NOUVELLE ÉQUIPE.',
  heroTitle2: 'UN NOUVEL ÉLAN.',
  heroSubtitle: 'Carrosserie • Peinture au four • Polissage & Rénovation à Kénitra',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=K%C3%A9nitra%2C%20Maroc',
  mapEmbed: 'https://www.google.com/maps?q=K%C3%A9nitra%2C%20Maroc&z=12&output=embed',
  legal: 'FLAMINGO AUTO KÉNITRA — Kénitra, Maroc',
} as const;

export interface SiteSettings {
  brand: string;
  city: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  instagram: string;
  instagramHandle: string;
  sloganFr: string;
  sloganAr: string;
  heroEyebrow: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  mapUrl: string;
  mapEmbed: string;
  legal: string;
  [key: string]: string;
}

export const DEFAULT_SETTINGS: SiteSettings = { ...OFFICIAL };

export const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/services', label: 'Services' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
] as const;

export const waLink = (whatsapp: string, message: string) =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
