<?php
/**
 * ——— FLAMINGO AUTO KÉNITRA — variante Hostinger PHP ———
 * Configuration du backend. Ce fichier N'EST PAS servi au public (exécuté par PHP).
 *
 * ⚠️ AVANT LA MISE EN PRODUCTION : changez le mot de passe admin.
 *    1. Générez un nouveau hash (sur votre machine ou via un script PHP temporaire) :
 *         php -r "echo password_hash('VOTRE_MOT_DE_PASSE', PASSWORD_DEFAULT), PHP_EOL;"
 *    2. Remplacez la valeur de 'admin_password_hash' ci-dessous.
 *    3. Supprimez tout script temporaire utilisé pour générer le hash.
 */
return [
    // Identifiant de connexion au dashboard (/admin)
    'admin_user' => 'admin',

    // Hash bcrypt du mot de passe admin.
    // Valeur par défaut = « flamingo2026 » (mot de passe de démonstration connu) :
    // À CHANGER IMPÉRATIVEMENT avant toute mise en ligne publique.
    'admin_password_hash' => '$2y$10$/.9FarRC/EQCXaSpoOzOYu5WsXSfK8ttTSuNUP9IimP5ztQMu3gse',

    // Nom du cookie de session (HttpOnly, SameSite=Lax, Secure en HTTPS)
    'cookie' => 'fk_php_session',

    // Durée de session : 12 h (identique au mode Node)
    'session_ttl' => 43200,

    // Sous-chemin du site sur le domaine.
    // Déploiement cible : https://threepointsmedia.com/flamingoauto/ → '/flamingoauto'
    // Si le site est à la racine d'un (sous-)domaine, mettez ''.
    'base_path' => '/flamingoauto',
];
