import { createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const supabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Client SSR (cookies de session de l'utilisateur connecté). */
export async function supabaseServer(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured()) return null;
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            /* appelé depuis un Server Component : rafraîchi par le middleware */
          }
        },
      },
    },
  );
}

/** Client « service role » pour les écritures serveur quand la RLS admin est requise. */
export function supabaseAdmin(): SupabaseClient | null {
  if (!supabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const TABLES: Record<string, string> = {
  customers: 'customers',
  vehicles: 'vehicles',
  repairs: 'repair_jobs',
  quotes: 'quotes',
  invoices: 'invoices',
  payments: 'payments',
  appointments: 'appointments',
  gallery: 'gallery_items',
  quoteRequests: 'quote_requests',
  messages: 'messages',
  promotions: 'promotions',
  services: 'services_content',
};
