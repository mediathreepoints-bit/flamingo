import { repo } from '@/lib/repo';
import type { ContactMessage } from '@/lib/types';
import MessagesManager from '@/components/admin/MessagesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Messages' };

export default async function MessagesPage() {
  const messages = await repo.list<ContactMessage>('messages');
  return <MessagesManager initial={messages} />;
}
