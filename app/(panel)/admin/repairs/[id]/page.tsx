import { notFound } from 'next/navigation';
import { repo } from '@/lib/repo';
import type { Customer, Repair, Vehicle } from '@/lib/types';
import RepairDetail from '@/components/admin/RepairDetail';

export const dynamic = 'force-dynamic';

export default async function RepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [repair, customers, vehicles] = await Promise.all([
    repo.get<Repair>('repairs', id),
    repo.list<Customer>('customers'),
    repo.list<Vehicle>('vehicles'),
  ]);
  if (!repair) notFound();
  return <RepairDetail repair={repair!} customers={customers} vehicles={vehicles} />;
}
