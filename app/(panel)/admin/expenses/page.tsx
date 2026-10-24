import { repo } from '@/lib/repo';
import type { Expense } from '@/lib/types';
import ExpensesManager from '@/components/admin/ExpensesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dépenses' };

export default async function ExpensesPage() {
  const expenses = await repo.list<Expense>('expenses');
  return <ExpensesManager initial={expenses} />;
}
