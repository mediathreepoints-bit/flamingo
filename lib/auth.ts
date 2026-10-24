import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { supabaseServer, supabaseConfigured } from './supabase';

const COOKIE = 'fk_admin_session';
const MAX_AGE = 60 * 60 * 12;

const secretKey = () =>
  new TextEncoder().encode(process.env.ADMIN_SECRET || 'flamingo-auto-kenitra-v2-secret');

export const adminPassword = () => process.env.ADMIN_PASSWORD || 'flamingo2026';

/** Connexion : Supabase Auth si configuré, sinon compte local de secours. */
export async function login(identifier: string, password: string): Promise<{ ok: boolean; error?: string; token?: string }> {
  if (supabaseConfigured()) {
    const sb = await supabaseServer();
    if (sb) {
      const { error } = await sb.auth.signInWithPassword({ email: identifier, password });
      if (error) return { ok: false, error: 'Identifiants incorrects' };
      return { ok: true };
    }
  }
  if (identifier !== 'admin' || password !== adminPassword()) {
    return { ok: false, error: 'Identifiants incorrects' };
  }
  const token = await new SignJWT({ role: 'admin', sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE, partitioned: process.env.NODE_ENV === 'production' });
  return { ok: true, token };
}

export async function logout() {
  if (supabaseConfigured()) {
    const sb = await supabaseServer();
    await sb?.auth.signOut();
  }
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<{ user: string } | null> {
  if (supabaseConfigured()) {
    const sb = await supabaseServer();
    if (sb) {
      const { data } = await sb.auth.getUser();
      if (data.user) return { user: data.user.email || 'admin' };
      return null;
    }
  }
  const store = await cookies();
  let token = store.get(COOKIE)?.value || null;
  if (!token) {
    // secours : jeton porté par header (middleware) ou Authorization Bearer (fetch client)
    try {
      const h = await headers();
      token = h.get('x-admin-token') || null;
      const auth = h.get('authorization');
      if (!token && auth && auth.startsWith('Bearer ')) token = auth.slice(7);
    } catch { /* headers indisponibles */ }
  }
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === 'admin' ? { user: String(payload.sub) } : null;
  } catch {
    return null;
  }
}
