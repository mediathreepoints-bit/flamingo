'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Trash2, Plus } from 'lucide-react';
import { cx } from '@/lib/format';

/* ————— Toaster ————— */
type Toast = { id: number; msg: string; kind: 'ok' | 'err' };
const ToastCtx = createContext<(msg: string, kind?: 'ok' | 'err') => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cx(
                'pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-card backdrop-blur',
                t.kind === 'ok' ? 'border-ok/40 bg-ok/10 text-ok' : 'border-danger/40 bg-danger/10 text-danger',
              )}
            >
              {t.kind === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ————— PageHeader ————— */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-steel-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ————— Modal ————— */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
            className={cx('max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-ink-500 bg-ink-800 p-6 shadow-lift', wide ? 'max-w-3xl' : 'max-w-lg')}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-black uppercase tracking-wide text-white">{title}</h2>
              <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-steel-400 transition hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ————— Table ————— */
export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  rows, columns, onEdit, onDelete, empty = 'Aucune donnée pour le moment.',
}: {
  rows: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  empty?: string;
}) {
  if (!rows.length) {
    return <div className="card p-10 text-center text-sm text-steel-500">{empty}</div>;
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-500 bg-ink-800/80">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 text-[11px] font-bold uppercase tracking-mega text-steel-500">{c.header}</th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-mega text-steel-500">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-ink-600/60 transition-colors last:border-0 hover:bg-ink-600/30">
                {columns.map((c) => (
                  <td key={c.key} className={cx('px-4 py-3 text-steel-200', c.className)}>
                    {c.render ? c.render(row) : String((row as any)[c.key] ?? '—')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="rounded-lg border border-ink-500 px-3 py-1.5 text-xs font-semibold text-steel-300 transition hover:border-flame-500/50 hover:text-white">
                          Modifier
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} aria-label="Supprimer" className="rounded-lg border border-ink-500 p-1.5 text-steel-400 transition hover:border-danger/50 hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ————— StatusChip ————— */
export function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span className="chip border" style={{ color, borderColor: `${color}55`, background: `${color}14` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

/* ————— Form helpers ————— */
export function TextInput({ label, value, onChange, type = 'text', placeholder, required, step }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; step?: string;
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-flame-500"> *</span>}</label>
      <input type={type} step={step} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="field" required={required} />
    </div>
  );
}

export function SelectInput({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-flame-500"> *</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field" required={required}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="field resize-none" />
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="btn-primary">
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}
