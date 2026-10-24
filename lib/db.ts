import fs from 'node:fs';
import path from 'node:path';
import { DB, emptyDB, GalleryItem, Promotion } from './types';
import { DEFAULT_SETTINGS } from './site';

import { appRoot } from './paths';

const DATA_DIR = path.join(appRoot(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

/** Galerie seed : paires avant/après constituées À PARTIR DES PHOTOS RÉELLES de l'atelier.
 *  - utilitaire : avant/après 100% réel (découpage du visuel Instagram publié par l'atelier) ;
 *  - 208 & Clio : « après » = photo réelle, « avant » = état reconstitué depuis cette photo réelle
 *    (clairement indiqué dans la description de chaque fiche). */
const seededGallery = (): GalleryItem[] => [
  {
    id: 'ga_utilitaire',
    title: 'Utilitaire Peugeot accidenté — repris et repeint',
    vehicle: 'Peugeot Partner — photos réelles',
    category: 'carrosserie',
    beforeImage: '/images/atelier/avant-apres-utilitaire-avant.jpg',
    afterImage: '/images/atelier/avant-apres-utilitaire-apres.jpg',
    description: 'Avant / après 100% réel publié par l’atelier : tôle froissée, remise en forme, puis peinture et finition.',
    demo: false,
    featured: true,
    year: new Date().getFullYear(),
  },
  {
    id: 'ga_208',
    title: 'Peugeot 208 — capot repeint noir profond',
    vehicle: 'Peugeot 208 — après : photo réelle',
    category: 'peinture',
    beforeImage: '/images/atelier/avant-208-peinture.jpg',
    afterImage: '/images/atelier/peinture-capot-noir-1.webp',
    description: 'Après : photo réelle sortie de cabine. Avant : état reconstitué à partir de cette photo réelle (ponçage, mastic, apprêts).',
    demo: false,
    featured: true,
    year: new Date().getFullYear(),
  },
  {
    id: 'ga_clio',
    title: 'Renault Clio — polissage & lustrage',
    vehicle: 'Renault Clio — après : photo réelle',
    category: 'polissage',
    beforeImage: '/images/atelier/avant-clio-polissage.jpg',
    afterImage: '/images/atelier/finition-clio-blanche.webp',
    description: 'Après : photo réelle de la finition livrée. Avant : état terne et rayé reconstitué à partir de cette photo réelle.',
    demo: false,
    featured: true,
    year: new Date().getFullYear(),
  },
];

/** Campagne extraite de l'affiche de réouverture : INACTIVE tant que l'administrateur
 *  n'a pas confirmé validité, services applicables, conditions et dates. */
const seedPromotions = (): Promotion[] => [
  {
    id: 'promo-reouverture',
    title: 'Grande réouverture',
    percent: 30,
    services: ['carrosserie', 'peinture', 'polissage', 'plastiques', 'vitrage', 'pieces', 'interieur', 'petites'],
    start: '',
    end: '',
    terms: 'Offre relevée sur l’affiche promotionnelle : à confirmer par l’administrateur (validité, services applicables, conditions, dates).',
    active: false,
    createdAt: new Date().toISOString(),
  },
];

export function seedDB(): DB {
  return { ...emptyDB(), settings: { ...DEFAULT_SETTINGS }, gallery: seededGallery(), promotions: seedPromotions() };
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadDB(): DB {
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as DB;
      const db = { ...emptyDB(), ...parsed };
      db.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
      return db;
    } catch {
      /* fichier corrompu → reseed */
    }
  }
  const seeded = seedDB();
  saveDB(seeded);
  return seeded;
}

export function saveDB(db: DB) {
  ensureDir();
  const tmp = `${DB_FILE}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

export function withDB<T>(fn: (db: DB) => T): T {
  const db = loadDB();
  const result = fn(db);
  saveDB(db);
  return result;
}
