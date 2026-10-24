import { repo } from '@/lib/repo';
import type { Customer, Invoice, Payment, Vehicle } from '@/lib/types';
import InvoicesManager from '@/components/admin/InvoicesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Factures' };

export default async function InvoicesPage() {
  const [invoices, customers, vehicles, payments] = await Promise.all([
    repo.list<Invoice>('invoices'),
    repo.list<Customer>('customers'),
    repo.list<Vehicle>('vehicles'),
    repo.list<Payment>('payments'),
  ]);
  return <InvoicesManager initial={invoices} customers={customers} vehicles={vehicles} payments={payments} />;
}
