import Link from 'next/link';
import { Users, CarFront, Wrench, Receipt, Wallet, Inbox, CalendarDays, MessageSquare, ArrowRight } from 'lucide-react';
import { repo } from '@/lib/repo';
import { fmtMoney, fmtDate } from '@/lib/format';
import { invoiceBalance, invoicePaid } from '@/lib/billing';
import { REPAIR_STATUS_META, QUOTE_STATUS_META, type Appointment, type ContactMessage, type Customer, type Invoice, type Payment, type Quote, type QuoteRequest, type Repair, type Vehicle } from '@/lib/types';
import { StatusChip } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

function StatCard({ icon: Icon, label, value, href, accent }: { icon: any; label: string; value: string; href: string; accent?: boolean }) {
  return (
    <Link href={href} className="card group flex items-center gap-4 p-5 transition-colors hover:border-flame-500/40">
      <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${accent ? 'bg-flame-500 text-white shadow-red' : 'border border-ink-500 bg-ink-800 text-flame-500'}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-mega text-steel-500">{label}</span>
        <span className="font-display mt-0.5 block truncate text-xl font-black text-white">{value}</span>
      </span>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-steel-600 transition-colors group-hover:text-flame-500" />
    </Link>
  );
}

export default async function AdminDashboard() {
  const [customers, vehicles, repairs, quotes, invoices, payments, appointments, quoteRequests, messages] = await Promise.all([
    repo.list<Customer>('customers'),
    repo.list<Vehicle>('vehicles'),
    repo.list<Repair>('repairs'),
    repo.list<Quote>('quotes'),
    repo.list<Invoice>('invoices'),
    repo.list<Payment>('payments'),
    repo.list<Appointment>('appointments'),
    repo.list<QuoteRequest>('quoteRequests'),
    repo.list<any>('messages'),
  ]);

  const activeRepairs = repairs.filter((r) => r.status !== 'livre');
  const collected = invoices.reduce((s, inv) => s + invoicePaid(payments, inv.id), 0);
  const outstanding = invoices.reduce((s, inv) => s + invoiceBalance(payments, inv), 0);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments
    .filter((a) => a.date >= today && a.status !== 'annule')
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
    .slice(0, 6);
  const newRequests = quoteRequests.filter((q) => q.status === 'nouveau');
  const newMessages = messages.filter((m: ContactMessage) => m.status === 'nouveau');

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-steel-400">Vue d’ensemble de l’activité de l’atelier.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Clients" value={String(customers.length)} href="/admin/customers" />
        <StatCard icon={CarFront} label="Véhicules" value={String(vehicles.length)} href="/admin/vehicles" />
        <StatCard icon={Wrench} label="Réparations en cours" value={String(activeRepairs.length)} href="/admin/repairs" accent />
        <StatCard icon={CalendarDays} label="RDV à venir" value={String(upcoming.length)} href="/admin/appointments" />
        <StatCard icon={Receipt} label="Factures" value={String(invoices.length)} href="/admin/invoices" />
        <StatCard icon={Wallet} label="Encaissé" value={fmtMoney(collected)} href="/admin/payments" />
        <StatCard icon={Wallet} label="Reste dû" value={fmtMoney(outstanding)} href="/admin/payments" accent={outstanding > 0} />
        <StatCard icon={Inbox} label="Demandes de devis" value={`${newRequests.length} nouvelle(s)`} href="/admin/quote-requests" accent={newRequests.length > 0} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* réparations récentes */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-black uppercase tracking-mega text-white">Réparations récentes</h2>
            <Link href="/admin/repairs" className="text-xs font-bold uppercase tracking-mega text-flame-400 hover:text-flame-500">Tout voir</Link>
          </div>
          {repairs.length === 0 ? (
            <p className="py-6 text-center text-sm text-steel-500">Aucune réparation enregistrée.</p>
          ) : (
            <ul className="space-y-2">
              {repairs.slice(0, 6).map((r) => {
                const c = customers.find((x) => x.id === r.customerId);
                const v = vehicles.find((x) => x.id === r.vehicleId);
                const meta = REPAIR_STATUS_META[r.status];
                return (
                  <li key={r.id}>
                    <Link href={`/admin/repairs/${r.id}`} className="flex items-center gap-3 rounded-lg border border-ink-600 bg-ink-800/60 px-4 py-3 transition hover:border-flame-500/40">
                      <span className="font-mono text-xs text-flame-500">{r.ref}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-steel-200">
                        {c?.nom || 'Client'} — {v ? `${v.marque} ${v.modele}` : 'Véhicule'}
                      </span>
                      <StatusChip label={meta.label} color={meta.color} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* activité demandes */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-black uppercase tracking-mega text-white">Demandes & messages</h2>
            <Link href="/admin/quote-requests" className="text-xs font-bold uppercase tracking-mega text-flame-400 hover:text-flame-500">Demandes</Link>
          </div>
          {newRequests.length === 0 && newMessages.length === 0 ? (
            <p className="py-6 text-center text-sm text-steel-500">Rien de nouveau à traiter.</p>
          ) : (
            <ul className="space-y-2">
              {newRequests.slice(0, 4).map((q) => (
                <li key={q.id} className="flex items-center gap-3 rounded-lg border border-ink-600 bg-ink-800/60 px-4 py-3 text-sm">
                  <Inbox className="h-4 w-4 shrink-0 text-flame-500" />
                  <span className="min-w-0 flex-1 truncate text-steel-200">{q.name} — {q.repairType || 'devis'} ({fmtDate(q.createdAt)})</span>
                  <StatusChip label="Nouveau" color="#38BDF8" />
                </li>
              ))}
              {newMessages.slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-lg border border-ink-600 bg-ink-800/60 px-4 py-3 text-sm">
                  <MessageSquare className="h-4 w-4 shrink-0 text-flame-500" />
                  <span className="min-w-0 flex-1 truncate text-steel-200">{m.name} — {String(m.message).slice(0, 60)}…</span>
                  <StatusChip label="Nouveau" color="#38BDF8" />
                </li>
              ))}
            </ul>
          )}

          <h3 className="font-display mt-6 mb-3 text-sm font-black uppercase tracking-mega text-white">Prochains rendez-vous</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-steel-500">Aucun rendez-vous à venir.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-lg border border-ink-600 bg-ink-800/60 px-4 py-3 text-sm">
                  <span className="font-mono text-xs text-steel-400">{fmtDate(a.date)} {a.start}</span>
                  <span className="min-w-0 flex-1 truncate text-steel-200">{a.name} — {a.vehicleLabel || a.type}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* derniers devis */}
      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-black uppercase tracking-mega text-white">Derniers devis</h2>
          <Link href="/admin/quotes" className="text-xs font-bold uppercase tracking-mega text-flame-400 hover:text-flame-500">Tout voir</Link>
        </div>
        {quotes.length === 0 ? (
          <p className="py-6 text-center text-sm text-steel-500">Aucun devis enregistré.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {quotes.slice(0, 4).map((q: Quote) => {
              const meta = QUOTE_STATUS_META[q.status];
              const c = customers.find((x) => x.id === q.customerId);
              return (
                <li key={q.id} className="flex items-center gap-3 rounded-lg border border-ink-600 bg-ink-800/60 px-4 py-3 text-sm">
                  <span className="font-mono text-xs text-flame-500">{q.ref}</span>
                  <span className="min-w-0 flex-1 truncate text-steel-200">{c?.nom || q.customerName || '—'}</span>
                  <StatusChip label={meta.label} color={meta.color} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
