'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { PHP_MODE } from '@/lib/client-env';
import { api } from './client-api';

/** En mode export PHP, le HTML admin est figé au build : les listes sont
 *  rechargées depuis l'API PHP au montage. En mode Node, comportement
 *  inchangé (les données viennent du serveur, `initial`). */
export function useLiveRows<T>(entity: string, initial: T[]): [T[], Dispatch<SetStateAction<T[]>>] {
  const [rows, setRows] = useState<T[]>(initial);
  useEffect(() => {
    if (!PHP_MODE) return;
    let on = true;
    api<{ rows: T[] }>(entity, 'GET')
      .then((r) => { if (on) setRows(r.rows || []); })
      .catch(() => { /* non autorisé ou réseau : garder `initial` */ });
    return () => { on = false; };
  }, [entity]);
  return [rows, setRows];
}

/** Collection liée (clients, véhicules…) : prop serveur en mode Node,
 *  rechargée depuis l'API en mode export PHP. */
export function useLiveRelated<T>(entity: string, prop: T[]): T[] {
  const [rows, setRows] = useState<T[] | null>(null);
  useEffect(() => {
    if (!PHP_MODE) return;
    let on = true;
    api<{ rows: T[] }>(entity, 'GET')
      .then((r) => { if (on) setRows(r.rows || []); })
      .catch(() => { /* garder la prop */ });
    return () => { on = false; };
  }, [entity]);
  return rows ?? prop;
}
