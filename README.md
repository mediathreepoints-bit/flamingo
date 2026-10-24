# FLAMINGO AUTO KÉNITRA — site vitrine + gestion d'atelier

Site officiel de **FLAMINGO AUTO KÉNITRA** (carrosserie, peinture au four, polissage
et rénovation automobile à Kénitra, Maroc), construit avec **Next.js 15 (App Router),
TypeScript, Tailwind CSS et Framer Motion**.

> Une nouvelle équipe. Un nouvel élan.
> Votre confiance, notre responsabilité. — ثقتكم مسؤوليتنا

## Site public

- **Accueil** : héro cinématique (photo d'atelier, diaporama glissant des prestations,
  parallaxe et animations d'entrée), 4 cartes services illustrées, comparateur
  avant/après interactif (curseur glissable, tactile et clavier) avec filtres par
  catégorie, section « Pourquoi nous choisir », bandeau WhatsApp et footer premium.
- **/services** : détail des 4 prestations avec diaporama animé des savoir-faire.
- **/realisations** : galerie avant/après filtrable (les médias actuels sont des
  **visuels illustratifs provisoires**, explicitement étiquetés, à remplacer par les
  photos réelles des chantiers via l'admin).
- **/devis** : formulaire de demande de devis validé, avec **upload des photos de
  dégâts** (jusqu'à 5).
- **/contact** : formulaire validé, téléphone, WhatsApp, Instagram et carte.
- Bouton **WhatsApp collant** sur mobile, intégration `wa.me/212661508674` sur tous
  les points de contact.
- SEO : métadonnées complètes (mots-clés « Carrosserie Kénitra », « Peinture au four
  Kénitra », « Polissage automobile Kénitra », « Rénovation automobile Kénitra »),
  `sitemap.xml` et `robots.txt` générés.

## Administration (`/admin`, protégée)

Clients, véhicules, réparations (suivi d'avancement en 8 étapes avec historique),
devis (éditeur de lignes, conversion en facture), rendez-vous, factures et
**PDF professionnels** (devis/facture, générés côté serveur), paiements & soldes,
galerie avant/après, demandes de devis du site, messages de contact et
**« Contenu du site »** : tous les textes publics (héro, slogans FR/AR,
coordonnées, liens) sont modifiables sans redéploiement.

## Données : mode local ou Supabase

- **Par défaut** : base JSON locale (`data/db.json`) — parfaite pour un VPS.
- **Supabase** (recommandé en production serverless) : renseignez
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et
  `SUPABASE_SERVICE_ROLE_KEY`, puis exécutez [`supabase/schema.sql`](./supabase/schema.sql).
  L'authentification admin passe alors par Supabase Auth et toutes les tables sont
  protégées par **Row Level Security** (les données clients ne sont jamais exposées
  publiquement).

Voir [`DEPLOYMENT.md`](./DEPLOYMENT.md) pour le déploiement pas à pas
(Netlify ou Hostinger/VPS).

## Développement

```bash
npm install
npm run dev        # http://localhost:3000
```

Connexion admin par défaut (mode local) : `admin` / `flamingo2026`
(à changer via `ADMIN_PASSWORD`).
