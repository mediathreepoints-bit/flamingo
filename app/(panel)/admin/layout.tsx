import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { repo } from '@/lib/repo';
import AdminShell from '@/components/admin/AdminShell';
import SessionGuard from '@/components/admin/SessionGuard';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s | Admin' }, robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Variante export PHP (hébergement statique) : pas de session serveur possible,
  // la garde est côté client et la protection réelle côté API PHP (401).
  if (process.env.NEXT_PUBLIC_EXPORT_MODE === 'php') {
    return <SessionGuard>{children}</SessionGuard>;
  }
  const session = await getSession();
  if (!session) redirect('/admin/login');
  const mode = repo.mode();
  return (
    <AdminShell user={session.user} mode={mode}>
      {children}
    </AdminShell>
  );
}
