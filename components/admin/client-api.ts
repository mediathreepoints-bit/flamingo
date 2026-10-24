export async function api<T = any>(
  entity: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  id?: string,
  body?: unknown,
): Promise<T> {
  let atk: string | null = null;
  try { atk = sessionStorage.getItem('fk_atk'); } catch { /* stockage indisponible */ }
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (atk) headers.Authorization = `Bearer ${atk}`;
  const res = await fetch(`/api/admin/${entity}${id ? `/${id}` : ''}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Erreur serveur');
  return json as T;
}

export async function convertQuoteApi(quoteId: string) {
  const res = await fetch('/api/admin/convert-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Erreur serveur');
  return json;
}
