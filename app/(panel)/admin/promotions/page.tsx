import PromotionsManager from '@/components/admin/PromotionsManager';
import { repo } from '@/lib/repo';
import type { Promotion } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  let rows: Promotion[] = [];
  try {
    rows = await repo.list<Promotion>('promotions');
  } catch {
    rows = [];
  }
  return <PromotionsManager initial={rows} />;
}
