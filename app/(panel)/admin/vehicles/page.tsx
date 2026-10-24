import { repo } from '@/lib/repo';
import type { Customer, Vehicle } from '@/lib/types';
import VehiclesManager from '@/components/admin/VehiclesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Véhicules' };

export default async function VehiclesPage() {
  const [vehicles, customers] = await Promise.all([repo.list<Vehicle>('vehicles'), repo.list<Customer>('customers')]);
  return <VehiclesManager initial={vehicles} customers={customers} />;
}
