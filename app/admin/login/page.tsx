import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/admin/LoginForm';
import { supabaseConfigured } from '@/lib/supabase';

export const metadata: Metadata = { title: 'Connexion admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const mode = supabaseConfigured() ? 'supabase' : 'local';
  return (
    <Suspense>
      <LoginForm mode={mode} />
    </Suspense>
  );
}
