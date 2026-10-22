import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { repo } from '@/lib/repo';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s | Admin' }, robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  const mode = repo.mode();
  return (
    <AdminShell user={session.user} mode={mode}>
      {children}
    </AdminShell>
  );
}
