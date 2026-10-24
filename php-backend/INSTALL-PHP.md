# Installation — variante Hostinger PHP (hébergement mutualisé)

Archive : `flamingo-auto-hostinger-php-AAAA-MM-JJ.zip` — **site compilé HTML/CSS/JS +
backend PHP**, sans Node.js en production. Conçu pour être extrait tel quel dans
`public_html/flamingoauto/` afin d'être servi sur `https://threepointsmedia.com/flamingoauto/`.

## Prérequis

| Élément | Requis |
|---|---|
| Hébergement | Hostinger mutualisé (Web/Cloud) avec `public_html` — **pas** besoin de Node.js |
| PHP | **≥ 8.0** (8.1–8.4 recommandé). Aucune extension au-delà du cœur (`json`, `session` non utilisée : sessions maison sur fichiers) |
| Apache/LiteSpeed | `mod_rewrite` actif + `.htaccess` autorisé (standard chez Hostinger) |
| HTTPS | Recommandé (le cookie de session passe en `Secure` automatiquement) |
| Permissions | `data/` et `uploads/` **inscriptibles** par PHP (775/664 typique chez Hostinger) |

## Installation (5 minutes)

1. hPanel → **Gestionnaire de fichiers** → ouvrez `public_html/`.
2. Créez le dossier `flamingoauto` (s'il n'existe pas) et **extrayez le ZIP à l'intérieur**.
   Après extraction, `public_html/flamingoauto/index.html` doit exister (le ZIP a déjà
   `index.html` à sa racine).
3. Vérifiez que les fichiers cachés sont bien là : `.htaccess` (racine), `api/.htaccess`,
   `data/.htaccess`, `uploads/.htaccess` (activez « Afficher les fichiers cachés »).
4. **Changez le mot de passe admin** dans `api/config.php` :
   - générez un hash : `php -r "echo password_hash('VOTRE_MOT_DE_PASSE', PASSWORD_DEFAULT);"`
     (ou créez temporairement `hash.php` avec `<?php echo password_hash('…', PASSWORD_DEFAULT);`,
     appelez-le une fois dans le navigateur, puis **supprimez-le**) ;
   - remplacez `admin_password_hash`. Le hash livré correspond au mot de passe de
     démonstration connu `flamingo2026` — **le laisser = laisser la porte ouverte**.
5. Si le site n'est PAS sous `/flamingoauto` (autre sous-chemin ou racine), adaptez
   `base_path` dans `api/config.php`.
6. Ouvrez `https://threepointsmedia.com/flamingoauto/` → le site s'affiche (FR ; `/en/` et
   `/ar/` pour les autres langues).
7. Connectez-vous à `…/flamingoauto/admin/login/` avec `admin` + votre mot de passe.

## Contrôle après installation

- [ ] Accueil, `/en/`, `/ar/` (RTL) s'affichent avec le design complet.
- [ ] `/admin/login/` → connexion → **Tableau de bord** avec cartes, graphique 14 jours, listes.
- [ ] Créer un client / véhicule / devis ; convertir le devis en facture ; saisir un paiement
      (le statut de la facture passe à « payée ») ; ajouter une dépense.
- [ ] Bouton PDF d'un devis et d'une facture → document en-tête noir, tableau, total TTC.
- [ ] Formulaire public `/devis/` avec photos → la demande apparaît dans « Demandes de devis ».
- [ ] Formulaire `/contact/` → apparaît dans « Messages ».
- [ ] `…/flamingoauto/data/db.json` dans le navigateur → **403/interdit** (jamais servi).

## Sécurité (déjà en place)

- Sessions serveur sur fichiers (`data/sessions/`, dossier interdit d'accès web), cookie
  `HttpOnly` + `SameSite=Lax` + `Secure` en HTTPS, expiration 12 h, purge automatique,
  identifiant régénéré à chaque connexion.
- Mot de passe stocké **hashé bcrypt** (`password_hash`), jamais en clair ni dans le JS.
- Toutes les routes `/api/admin/*` et `/api/pdf/*` exigent la session (401 sinon) ;
  contrôle `Origin` contre le CSRF ; écritures JSON verrouillées (`flock`) et atomiques.
- `data/` bloqué par `.htaccess` **et** par règle de réécriture racine (double protection).
- `uploads/` : exécution PHP désactivée, index désactivés, seules les vraies images
  (JPEG/PNG/WEBP/GIF validés par octets magiques, ≤ 10 Mo, ≤ 6 fichiers) sont acceptées,
  noms aléatoires.

## Sauvegarde / migration

- Données : `data/db.json` (clients, devis, factures, paiements, dépenses, demandes…) +
  `uploads/` (photos téléversées). Copiez ces deux éléments pour sauvegarder.
- Pour revenir au mode Node/Supabase : le ZIP Node (`flamingo-auto-hostinger-*.zip`) et les
  sources d'origine sont dans le dépôt GitHub — le format de `db.json` est **identique**.

## Limites connues de cette variante (honnêtement)

1. **Contenu « Contenu du site » (réglages : téléphone, héros, cartes)** : éditable dans
   l'admin et utilisé par les PDF, mais les pages publiques statiques affichent les valeurs
   figées au moment de l'export. Pour les refléter sur le site public, régénérez le ZIP
   (`node scripts/export-hostinger-php.mjs`) et re-déployez. **Galerie, promotions et
   services, eux, sont rafraîchis en direct** depuis l'API PHP.
2. **PDF** : mise en page fidèle (mêmes cotes/couleurs/police Helvetica), mais le rendu
   vectoriel diffère très légèrement du moteur pdfkit d'origine (arrondis, espacement).
   Les documents restent strictement mono-page comme l'original (au-delà de ~12 lignes,
   le tableau peut déborder — comme dans la version Node).
3. **Agent WhatsApp** : logique 100 % client (inchangée) — aucun serveur requis.
4. **Supabase** : non applicable dans cette variante (base locale JSON uniquement).
