import type { RepairCategory } from './types';

/**
 * Photographies RÉELLES de l'atelier Flamingo Auto Kénitra
 * (source : Instagram @flamingo_auto_kenitra), publiées telles quelles.
 * `tag: 'atelier'` = vue de l'établissement (hors catégorie de prestation).
 */
export interface AtelierPhoto {
  src: string;
  category: RepairCategory | 'atelier';
  caption: number; // index dans t.atelier.captions
  wide?: boolean;
}

export const REAL_PHOTOS: AtelierPhoto[] = [
  { src: '/images/atelier/atelier-hall.webp', category: 'atelier', caption: 2, wide: true },
  { src: '/images/atelier/facade-atelier.jpg', category: 'atelier', caption: 9, wide: true },
  { src: '/images/atelier/peinture-capot-noir-1.webp', category: 'peinture', caption: 0 },
  { src: '/images/atelier/finition-clio-blanche.webp', category: 'polissage', caption: 6 },
  { src: '/images/atelier/cabine-peinture-1.webp', category: 'peinture', caption: 7 },
  { src: '/images/atelier/exterieur-bmw-prepa.jpg', category: 'carrosserie', caption: 5 },
  { src: '/images/atelier/peinture-capot-noir-2.webp', category: 'peinture', caption: 1 },
  { src: '/images/atelier/cabine-peinture-2.jpg', category: 'peinture', caption: 8 },
  { src: '/images/atelier/peinture-capot-gris.webp', category: 'peinture', caption: 4 },
  { src: '/images/atelier/post-nouvelle-etape.webp', category: 'renovation', caption: 3 },
  { src: '/images/atelier/avant-apres-utilitaire.webp', category: 'carrosserie', caption: 10 },
];

/** Ordre d'affichage en mosaïque (alternance des formats). */
export const MOSAIC_ORDER = [0, 10, 2, 3, 1, 4, 6, 5, 8, 7, 9];

/** Images réelles utilisées pour les cartes services et le diaporama. */
export const SERVICE_IMAGES: Record<RepairCategory, string> = {
  carrosserie: '/images/atelier/exterieur-bmw-prepa.jpg',
  peinture: '/images/atelier/cabine-peinture-1.webp',
  polissage: '/images/atelier/finition-clio-blanche.webp',
  renovation: '/images/atelier/atelier-hall.webp',
};
