import { repo } from '@/lib/repo';
import type { QuoteRequest } from '@/lib/types';
import QuoteRequestsManager from '@/components/admin/QuoteRequestsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Demandes de devis' };

export default async function QuoteRequestsPage() {
  const requests = await repo.list<QuoteRequest>('quoteRequests');
  return <QuoteRequestsManager initial={requests} />;
}
