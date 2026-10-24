import { repo } from '@/lib/repo';
import type { GalleryItem } from '@/lib/types';
import GalleryManager from '@/components/admin/GalleryManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Galerie avant/après' };

export default async function GalleryPage() {
  const items = await repo.list<GalleryItem>('gallery');
  return <GalleryManager initial={items} />;
}
