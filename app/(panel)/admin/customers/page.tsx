import { repo } from '@/lib/repo';
import type { Customer, Vehicle } from '@/lib/types';
import CustomersManager from '@/components/admin/CustomersManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Clients' };

export default async function CustomersPage() {
  const [customers, vehicles] = await Promise.all([repo.list<Customer>('customers'), repo.list<Vehicle>('vehicles')]);
  return <CustomersManager initial={customers} vehicles={vehicles} />;
}
