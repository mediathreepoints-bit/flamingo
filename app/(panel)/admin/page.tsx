import { repo } from '@/lib/repo';
import DashboardView from '@/components/admin/DashboardView';
import DashboardClient from '@/components/admin/DashboardClient';
import type { Appointment, ContactMessage, Customer, GalleryItem, Invoice, Payment, Promotion, Quote, QuoteRequest, Repair, Vehicle } from '@/lib/types';
import type { Expense } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Variante export PHP : le tableau de bord charge ses données côté client.
  if (process.env.NEXT_PUBLIC_EXPORT_MODE === 'php') return <DashboardClient />;

  const [customers, vehicles, repairs, quotes, invoices, payments, appointments, quoteRequests, messages, gallery, promotions, expenses] = await Promise.all([
    repo.list<Customer>('customers'),
    repo.list<Vehicle>('vehicles'),
    repo.list<Repair>('repairs'),
    repo.list<Quote>('quotes'),
    repo.list<Invoice>('invoices'),
    repo.list<Payment>('payments'),
    repo.list<Appointment>('appointments'),
    repo.list<QuoteRequest>('quoteRequests'),
    repo.list<ContactMessage>('messages'),
    repo.list<GalleryItem>('gallery'),
    repo.list<Promotion>('promotions'),
    repo.list<Expense>('expenses'),
  ]);

  return (
    <DashboardView
      customers={customers} vehicles={vehicles} repairs={repairs} quotes={quotes}
      invoices={invoices} payments={payments} appointments={appointments}
      quoteRequests={quoteRequests} messages={messages} gallery={gallery}
      promotions={promotions} expenses={expenses}
    />
  );
}
