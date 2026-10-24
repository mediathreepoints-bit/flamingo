import { repo } from '@/lib/repo';
import type { Customer, Invoice, Payment } from '@/lib/types';
import PaymentsManager from '@/components/admin/PaymentsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Paiements & Soldes' };

export default async function PaymentsPage() {
  const [payments, invoices, customers] = await Promise.all([
    repo.list<Payment>('payments'),
    repo.list<Invoice>('invoices'),
    repo.list<Customer>('customers'),
  ]);
  return <PaymentsManager initial={payments} invoices={invoices} customers={customers} />;
}
