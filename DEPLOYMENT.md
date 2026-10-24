# Déploiement — FLAMINGO AUTO KÉNITRA

Le site est un projet **Next.js 15 (App Router) + TypeScript + Tailwind CSS**.
Deux modes de données :

| Mode | Activation | Stockage |
|---|---|---|
| **Base locale (JSON)** | par défaut | `data/db.json` + uploads dans `public/uploads/` |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` renseignées | Tables Postgres + Storage, protégés par RLS |

## 1) Créer le projet Supabase (recommandé en production)

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Ouvrez **SQL Editor** et exécutez intégralement [`supabase/schema.sql`](./supabase/schema.sql).
   Le script crée les tables métier, les policies **Row Level Security** (aucune donnée client
   n'est exposée publiquement), les buckets storage `gallery` (public en lecture) et
   `damage-photos` (privé), ainsi que les réglages du site.
3. Dans **Authentication → Users**, créez l'utilisateur administrateur (email + mot de passe),
   puis activez son rôle admin :
   ```sql
   update public.profiles set is_admin = true where id = '<uuid-de-l-utilisateur>';
   ```
4. Récupérez dans **Settings → API** : l'URL du projet, la clé `anon` et la clé `service_role`.
5. Renseignez les variables d'environnement (voir `.env.example`) sur l'hébergeur :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secrète — côté serveur uniquement)

La connexion à `/admin/login` utilise alors **Supabase Auth**. Sans ces variables, le site
bascule automatiquement sur la base JSON locale et le compte local `admin` /
`ADMIN_PASSWORD` (défaut `flamingo2026`).

## 2) Netlify

Le fichier [`netlify.toml`](./netlify.toml) est déjà configuré (plugin Next.js officiel).

1. Poussez le dépôt sur GitHub.
2. Sur Netlify : **Add new site → Import from Git**, sélectionnez la branche.
3. Build command : `npm run build` — Publish directory : `.next` (déjà définis).
4. Dans **Site settings → Environment variables**, ajoutez les variables Supabase
   (et `NEXT_PUBLIC_SITE_URL=https://votre-domaine`).
5. Déployez. Les formulaires publics (devis/contact) écrivent dans Supabase ;
   les uploads de photos utilisent Supabase Storage si configuré, sinon le disque.

> Astuce : en mode base locale sur Netlify, le disque est éphémère — utilisez Supabase
> pour la persistance. Le mode local est idéal pour Hostinger/VPS.

## 3) Hostinger (VPS ou hébergement Node)

**VPS (recommandé)** :

```bash
# sur le serveur (Node 18.3+)
git clone <votre-depot> flamingo && cd flamingo
cp .env.example .env.local   # complétez les variables
npm ci
npm run build
npm install -g pm2
pm2 start npm --name flamingo -- start
pm2 save && pm2 startup
```

Configurez Nginx en reverse proxy vers `127.0.0.1:3000` et un certificat Let's Encrypt.
En mode base locale, les données vivent dans `data/db.json` et `public/uploads/` —
pensez aux sauvegardes régulières de ces deux dossiers.

**Hostinger Web (sans Node)** : un export statique n'est pas possible (l'admin et les
API sont dynamiques). Utilisez un VPS Hostinger, Netlify, ou tout hébergeur Node.

## 4) Après mise en ligne

- Vérifiez `/admin/login` puis chaque écran admin.
- Dans **Admin → Contenu du site**, contrôlez textes, téléphone, WhatsApp, Instagram
  et le lien Google Maps avant publication définitive.
- Dans **Admin → Galerie avant/après**, remplacez les visuels illustratifs provisoires
  par les photos réelles des chantiers (l'étiquette « Visuel illustratif » disparaît
  quand l'entrée est marquée « Réelle »).
- `sitemap.xml` et `robots.txt` sont générés automatiquement ; mettez
  `NEXT_PUBLIC_SITE_URL` à jour pour qu'ils pointent vers le bon domaine.
