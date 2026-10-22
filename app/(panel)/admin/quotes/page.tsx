import { repo } from '@/lib/repo';
import type { Customer, Quote, Vehicle } from '@/lib/types';
import QuotesManager from '@/components/admin/QuotesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Devis' };

export default async function QuotesPage() {
  const [quotes, customers, vehicles] = await Promise.all([
    repo.list<Quote>('quotes'),
    repo.list<Customer>('customers'),
    repo.list<Vehicle>('vehicles'),
  ]);
  return <QuotesManager initial={quotes} customers={customers} vehicles={vehicles} />;
}
