/** Environnement client/serveur partagé.
 *  - BASE_PATH : préfixe de sous-chemin (variante Hostinger PHP : '/flamingoauto').
 *    Vide en mode Node (le site est à la racine).
 *  - PHP_MODE : vrai pour le build d'export statique + backend PHP.
 *    Les fetch API doivent alors passer par apiUrl() et les données des
 *    gestionnaires admin sont rechargées côté client (le HTML est figé au build). */
export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const PHP_MODE: boolean = process.env.NEXT_PUBLIC_EXPORT_MODE === 'php';
export const apiUrl = (p: string): string => `${BASE_PATH}${p}`;
