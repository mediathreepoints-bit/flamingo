import { repo } from '@/lib/repo';
import type { Customer, Repair, Vehicle } from '@/lib/types';
import RepairsManager from '@/components/admin/RepairsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Réparations' };

export default async function RepairsPage() {
  const [repairs, customers, vehicles] = await Promise.all([
    repo.list<Repair>('repairs'),
    repo.list<Customer>('customers'),
    repo.list<Vehicle>('vehicles'),
  ]);
  return <RepairsManager initial={repairs} customers={customers} vehicles={vehicles} />;
}
