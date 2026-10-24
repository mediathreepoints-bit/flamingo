# Déploiement sur Hostinger — FLAMINGO AUTO KÉNITRA

Le projet est un **Next.js 15 (App Router)** complet : pages SSR, API routes, middleware,
admin ERP. Hostinger le fait tourner en **mode serveur** avec le build *standalone* de Next
(`output: 'standalone'` est déjà configuré dans `next.config.mjs`).

> ⚠️ Les hébergements **mutualisés « Web » basiques (PHP)** de Hostinger ne peuvent PAS faire
> tourner ce site. Il faut soit un plan avec **applications Node.js** (Business Web Hosting,
> Cloud Startup/Professional/Enterprise), soit un **VPS**.

## Générer l'archive d'export

```bash
node scripts/export-hostinger.mjs
```

Cela construit le projet puis génère **`flamingo-auto-hostinger.zip`** à la racine :
code source complet + `public/` + `data/db.json` (contenu actuel du site) + ce guide.
Hostinger se charge lui-même d'installer les dépendances et de builder.

## Option A — hPanel « Node.js Web App » avec le ZIP (recommandé, sans serveur à gérer)

1. hPanel → **Sites web** → **Ajouter un site web** → **Application web Node.js**.
2. Choisissez **Téléverser une archive .zip** et envoyez `flamingo-auto-hostinger.zip`.
3. Réglages (normalement auto-détectés, le framework est reconnu via `package.json`) :

   | Champ | Valeur |
   |---|---|
   | Type d'application | `next` |
   | Version Node.js | **20 ou plus** |
   | Commande d'installation | `npm ci` |
   | Script de build | `build` |
   | Répertoire de sortie | `.next` |
   | Fichier d'entrée | — (ignoré pour `next`) |

4. **Variables d'environnement** (hPanel → votre app → Environment) — à définir **avant** le
   build, les `NEXT_PUBLIC_*` sont intégrées au build :

   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://votre-domaine.ma` (canonical, sitemap, OG) |
   | `ADMIN_SECRET` | une longue clé aléatoire **à changer absolument** |
   | `ADMIN_PASSWORD` | votre mot de passe admin (défaut : `flamingo2026` → **changez-le**) |
   | `NEXT_PUBLIC_SUPABASE_URL` | (optionnel) active le mode Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (optionnel) idem |
   | `SUPABASE_SERVICE_ROLE_KEY` | (optionnel) idem |

5. Cliquez **Deploy**. Hostinger applique le build standalone et démarre le serveur bundled.

## Option B — hPanel depuis le dépôt GitHub

Même écran, mais choisissez **Importer un dépôt Git** (collez l'URL du dépôt public, ou
connectez l'App GitHub Hostinger). Réglages et variables identiques à l'option A.
À chaque `git push`, Hostinger peut redéployer.

## Option C — VPS Hostinger (contrôle total)

```bash
# Node 20+ (nvm recommandé), puis :
npm ci
npm run build
npm run start            # next start -H 0.0.0.0 -p 3000

# OU en mode autonome (plus léger) :
node .next/standalone/server.js   # HOSTNAME=0.0.0.0 PORT=3000
#   → copiez d'abord public/ et .next/static/ dans .next/standalone/ :
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

Gardez-le vivant avec PM2 (le fichier `ecosystem.config.cjs` est inclus) :

```bash
npm i -g pm2
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup
```

Terminez avec Nginx en reverse proxy (`proxy_pass http://127.0.0.1:3000;`) et un certificat
Let's Encrypt (`certbot --nginx -d votre-domaine.ma`).

## Données & uploads (important)

- **Mode par défaut (base locale)** : les données vivent dans `data/db.json` et les photos
  téléversées dans `public/uploads/`. Ces fichiers sont **conservés entre les builds**, mais un
  nouveau téléversement de ZIP (option A) **écrase** `data/db.json` : sauvegardez-le avant
  (hPanel → Gestionnaire de fichiers) si vous avez saisi des données entre-temps.
- **Mode Supabase (recommandé en production)** : renseignez les 3 variables Supabase et
  exécutez `supabase/schema.sql` (voir [DEPLOYMENT.md](./DEPLOYMENT.md)). Les données sont alors
  en base Postgres avec RLS, indépendantes des redéploiements.

## Après la mise en ligne — checklist

- [ ] `https://votre-domaine/` affiche le site (FR, `/en`, `/ar`).
- [ ] `/admin` renvoie vers la page de connexion ; connectez-vous et **changez** mot de passe
      et `ADMIN_SECRET`.
- [ ] Créez une demande de devis sur `/devis` → elle apparaît dans **Demandes de devis**.
- [ ] Téléversez une photo dans la galerie admin → l'image est bien servie (`/uploads/...`).
- [ ] `sitemap.xml` et `robots.txt` répondent ; la balise canonical utilise le vrai domaine.

## Accès administrateur

- URL : `/admin` (lien « Dashboard » dans le pied de page du site).
- Identifiant : `admin` — mot de passe : valeur de `ADMIN_PASSWORD` (défaut `flamingo2026`).
- La session fonctionne par cookie **et** par jeton `?atk=` (compatible iframes/apercus).
