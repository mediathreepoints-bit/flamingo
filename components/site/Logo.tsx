import Image from 'next/image';
import { cx } from '@/lib/format';

/** Flamant seul (extrait du logo officiel, fond transparent). */
export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
  const h = Math.round((size * 552) / 537);
  return (
    <Image
      src="/images/logo-mark.png"
      alt=""
      width={537}
      height={552}
      aria-hidden
      className={cx('shrink-0', className)}
      style={{ width: size, height: h }}
    />
  );
}

/**
 * Logo officiel Flamingo Auto (flamant + silhouette + wordmark + tagline),
 * extrait en PNG transparent depuis le visuel fourni par l'atelier.
 */
export function Logo({
  brand = 'FLAMINGO AUTO',
  city = 'KÉNITRA',
  size = 40,
  stacked = false,
  className,
}: {
  brand?: string;
  city?: string;
  size?: number;
  stacked?: boolean;
  className?: string;
}) {
  const w = Math.round((size * 1919) / 552);
  return (
    <span className={cx('inline-flex items-center', className)}>
      <Image
        src="/images/logo-flamingo.png"
        alt={`${brand} ${city} — carrosserie, peinture, polissage`}
        width={1919}
        height={552}
        style={{ width: w, height: size }}
        className="shrink-0"
      />
    </span>
  );
}
