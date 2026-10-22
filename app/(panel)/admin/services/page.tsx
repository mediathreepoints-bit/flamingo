import ServicesManager from '@/components/admin/ServicesManager';
import { repo } from '@/lib/repo';
import { getDict } from '@/lib/i18n';
import { SERVICES8_META } from '@/lib/services8';
import type { ServiceContent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  let rows: ServiceContent[] = [];
  try {
    rows = await repo.list<ServiceContent>('services');
  } catch {
    rows = [];
  }
  const fr = getDict('fr').services8.items;
  const en = getDict('en').services8.items;
  const ar = getDict('ar').services8.items;
  const defaults: Record<string, { image: string; fr: { title: string; desc: string }; en: { title: string; desc: string }; ar: { title: string; desc: string } }> = {};
  SERVICES8_META.forEach((m, i) => {
    defaults[m.id] = { image: m.image, fr: fr[i], en: en[i], ar: ar[i] };
  });
  return <ServicesManager initial={rows} defaults={defaults} />;
}
