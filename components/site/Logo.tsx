import { cx } from '@/lib/format';

const RED = '#F04438';

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lmg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor={RED} />
          <stop offset="1" stopColor="#B42318" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="26" fill="url(#lmg)" />
      <path
        d="M40 84 C33 67 36 54 46 47 C42 44 38 44 34 46 C40 36 50 31 58 33 C57 27 60 22 66 20 C63 26 64 31 67 34 C72 33 77 35 79 39 C73 38 69 39 66 42 C70 52 69 63 63 71 C58 78 50 83 40 84 Z"
        fill="#0B0C0E"
      />
      <circle cx="61.5" cy="31" r="3.4" fill="#FFF" />
    </svg>
  );
}

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
  return (
    <span className={cx('flex items-center gap-3', className)}>
      <LogoMark size={size} />
      <span className={cx('flex', stacked ? 'flex-col' : 'flex-col')}>
        <span className="font-display text-lg font-black leading-none tracking-wide text-white">{brand}</span>
        <span className="mt-1 font-display text-[10px] font-bold leading-none tracking-mega text-flame-500">
          {city}
        </span>
      </span>
    </span>
  );
}
