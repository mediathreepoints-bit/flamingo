import { repo } from '@/lib/repo';
import { DEFAULT_SETTINGS } from '@/lib/site';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contenu du site' };

export default async function SettingsPage() {
  const settings = { ...DEFAULT_SETTINGS, ...(await repo.settings()) };
  return <SettingsForm settings={settings} />;
}
