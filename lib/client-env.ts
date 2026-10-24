/** Environnement client/serveur partagé.
 *  - BASE_PATH : préfixe de sous-chemin (variante Hostinger PHP : '/flamingoauto').
 *    Vide en mode Node (le site est à la racine).
 *  - PHP_MODE : vrai pour le build d'export statique + backend PHP.
 *    Les fetch API doivent alors passer par apiUrl() et les données des
 *    gestionnaires admin sont rechargées côté client (le HTML est figé au build). */
export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const PHP_MODE: boolean = process.env.NEXT_PUBLIC_EXPORT_MODE === 'php';
export const apiUrl = (p: string): string => `${BASE_PATH}${p}`;

/** Parse une réponse JSON de l'API. Si le serveur renvoie du HTML (API
 *  inaccessible, réécriture .htaccess manquante, aperçu statique…), lève une
 *  erreur explicite au lieu de « Unexpected token '<' … is not valid JSON ». */
export async function safeJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    const looksHtml = text.trimStart().startsWith('<');
    throw new Error(
      looksHtml
        ? 'API inaccessible : le serveur a renvoyé une page HTML au lieu du JSON (hébergement statique sans backend PHP ?)'
        : 'Réponse du serveur illisible (JSON invalide)',
    );
  }
}
