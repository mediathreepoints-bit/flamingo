import fs from 'node:fs';
import path from 'node:path';
import { DB, emptyDB, GalleryItem } from './types';
import { DEFAULT_SETTINGS } from './site';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

/** Galerie d'attente : médias illustratifs uniquement (jamais présentés comme de vrais chantiers). */
const placeholderGallery = (): GalleryItem[] => [
  {
    id: 'ga_demo1',
    title: 'Exemple — réparation de flanc',
    vehicle: 'Visuel illustratif',
    category: 'carrosserie',
    beforeImage: '/images/before-1.jpg',
    afterImage: '/images/after-1.jpg',
    description: "Média illustratif provisoire, en attente des photographies de chantiers réels de l'atelier.",
    demo: true,
    featured: true,
    year: new Date().getFullYear(),
  },
  {
    id: 'ga_demo2',
    title: 'Exemple — redressage & brillance',
    vehicle: 'Visuel illustratif',
    category: 'polissage',
    beforeImage: '/images/before-2.jpg',
    afterImage: '/images/after-2.jpg',
    description: "Média illustratif provisoire, en attente des photographies de chantiers réels de l'atelier.",
    demo: true,
    featured: true,
    year: new Date().getFullYear(),
  },
  {
    id: 'ga_demo3',
    title: 'Exemple — bouclier avant repris',
    vehicle: 'Visuel illustratif',
    category: 'carrosserie',
    beforeImage: '/images/before-3.jpg',
    afterImage: '/images/after-3.jpg',
    description: "Média illustratif provisoire, en attente des photographies de chantiers réels de l'atelier.",
    demo: true,
    year: new Date().getFullYear(),
  },
];

export function seedDB(): DB {
  return { ...emptyDB(), settings: { ...DEFAULT_SETTINGS }, gallery: placeholderGallery() };
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
