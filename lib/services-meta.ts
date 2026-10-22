/** Métadonnées des 8 prestations officielles (affiche + brief).
 *  Module pur : utilisable côté client comme côté serveur. */
export const SERVICES8_META = [
  { id: 'carrosserie', icon: 'Car', image: '/images/atelier/exterieur-bmw-prepa.jpg' },
  { id: 'peinture', icon: 'SprayCan', image: '/images/atelier/cabine-peinture-1.webp' },
  { id: 'polissage', icon: 'Sparkles', image: '/images/atelier/finition-clio-blanche.webp' },
  { id: 'plastiques', icon: 'Flame', image: '/images/atelier/atelier-hall.webp' },
  { id: 'vitrage', icon: 'GlassWater', image: '/images/service-vitrage.jpg' },
  { id: 'pieces', icon: 'Package', image: '/images/service-pieces.jpg' },
  { id: 'interieur', icon: 'Armchair', image: '/images/service-interieur.jpg' },
  { id: 'petites', icon: 'Wrench', image: '/images/service-petites.jpg' },
] as const;

export type Service8Id = (typeof SERVICES8_META)[number]['id'];

export interface Service8 {
  id: Service8Id | string;
  icon: string;
  image: string;
  title: string;
  desc: string;
  sub: string;
}
