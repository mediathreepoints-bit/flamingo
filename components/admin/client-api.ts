import { apiUrl, safeJson } from '@/lib/client-env';

// Jeton de session admin : sessionStorage d'abord, sinon l'URL (?atk=) —
// fonctionne même dans un iframe où le stockage est bloqué.
export function getAtk(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.sessionStorage.getItem('fk_atk');
    if (v) return v;
  } catch { /* stockage bloqué */ }
  try {
    return new URLSearchParams(window.location.search).get('atk');
  } catch {
    return null;
  }
}

export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { ...(extra || {}) };
  const atk = getAtk();
  if (atk) h.Authorization = `Bearer ${atk}`;
  return h;
}

export async function api<T = any>(
  entity: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  id?: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(apiUrl(`/api/admin/${entity}${id ? `/${id}` : ''}`), {
    method,
    headers: authHeaders(body ? { 'Content-Type': 'application/json' } : undefined),
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const json = await safeJson<T>(res).catch((e) => {
    if (!res.ok) return { error: 'Erreur serveur' } as T;
    throw e;
  });
  if (!res.ok) throw new Error((json as any)?.error || 'Erreur serveur');
  return json as T;
}

export async function convertQuoteApi(quoteId: string) {
  const res = await fetch(apiUrl('/api/admin/convert-quote'), {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ quoteId }),
  });
  const json = await safeJson(res).catch((e) => {
    if (!res.ok) return { error: 'Erreur serveur' };
    throw e;
  });
  if (!res.ok) throw new Error(json?.error || 'Erreur serveur');
  return json;
}
