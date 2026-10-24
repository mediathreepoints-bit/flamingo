import type { Promotion } from './types';

/**
 * Campagne affichable sur le site : active ET dans sa fenêtre de dates.
 * Aucune remise n'est présentée comme actuelle tant que l'administrateur
 * n'a pas activé la campagne et renseigné ses dates/conditions.
 */
export function activePromotion(rows: Promotion[], now = new Date()): Promotion | null {
  const within = (rows || []).filter((p) => {
    if (!p || p.active !== true || !(Number(p.percent) > 0)) return false;
    const s = p.start ? new Date(`${p.start}T00:00:00`) : null;
    const e = p.end ? new Date(`${p.end}T23:59:59`) : null;
    if (s && now < s) return false;
    if (e && now > e) return false;
    return true;
  });
  return within.sort((a, b) => b.percent - a.percent)[0] || null;
}
