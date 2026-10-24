export const fmtMoney = (n: number, opts?: { decimals?: boolean }) => {
  const v = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: opts?.decimals ? 2 : 0,
    maximumFractionDigits: opts?.decimals ? 2 : 0,
  }).format(Number.isFinite(n) ? n : 0);
  return `${v.replace(/\u202F|\u00A0/g, ' ')} MAD`;
};

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const fmtDateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const monthKey = (iso: string) => iso.slice(0, 7);

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

export const lineTotals = (items: { qty: number; price: number }[], discount: number = 0, tva: number = 20) => {
  const ht = items.reduce((s, it) => s + it.qty * it.price, 0);
  const after = Math.max(0, ht - discount);
  const tvaAmount = (after * tva) / 100;
  return { ht, discount, tvaAmount, ttc: after + tvaAmount };
};

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');
