import { repo } from '@/lib/repo';
import type { Appointment } from '@/lib/types';
import AppointmentsManager from '@/components/admin/AppointmentsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Rendez-vous' };

export default async function AppointmentsPage() {
  const appointments = await repo.list<Appointment>('appointments');
  return <AppointmentsManager initial={appointments} />;
}
