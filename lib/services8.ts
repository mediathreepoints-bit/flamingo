import { repo } from './repo';
import type { Dict, Locale } from './i18n';
import type { ServiceContent } from './types';
import { SERVICES8_META, type Service8 } from './services-meta';

export { SERVICES8_META } from './services-meta';
export type { Service8, Service8Id } from './services-meta';

/** Fusion des textes par défaut (i18n) avec les éventuelles surcharges administrateur. */
export async function getServices8(locale: Locale, t: Dict): Promise<Service8[]> {
  const defaults = t.services8.items;
  let overrides: ServiceContent[] = [];
  try {
    overrides = await repo.list<ServiceContent>('services');
  } catch {
    overrides = [];
  }
  return SERVICES8_META.map((m, i) => {
    const ov = overrides.find((o) => o.id === m.id);
    const loc = ov ? (ov as unknown as Record<string, { title?: string; desc?: string; sub?: string } | undefined>)[locale] : undefined;
    return {
      id: m.id,
      icon: m.icon,
      image: ov?.image || m.image,
      title: loc?.title || defaults[i].title,
      desc: loc?.desc || defaults[i].desc,
      sub: loc?.sub || defaults[i].sub,
    };
  });
}
