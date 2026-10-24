'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, PhoneCall } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFab';
import { LogoMark } from './Logo';
import { waLink } from '@/lib/site';
import { detectIntent, answerFor, type AgentCtx } from '@/lib/agent';
import type { Dict, Locale } from '@/lib/i18n';
import type { Promotion } from '@/lib/types';
import { cx } from '@/lib/format';

interface Msg {
  id: number;
  role: 'bot' | 'user';
  text: string;
  actions?: boolean; // affiche les boutons WhatsApp / appel
  serviceChips?: boolean; // affiche les 8 prestations cliquables
}

type Step = 'idle' | 'service' | 'vehicle' | 'desc';

/** Icône WhatsApp + agent de réponse automatique (FR/EN/AR) avec relais vers l'atelier. */
export default function WhatsAppAgent({
  locale,
  t,
  whatsapp,
  phone,
  phoneRaw,
  promo,
  services,
}: {
  locale: Locale;
  t: Dict;
  whatsapp: string;
  phone: string;
  phoneRaw: string;
  promo: Promotion | null;
  services: string[];
}) {
  const ctx: AgentCtx = { locale, t, phone, services, promo };
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const draft = useRef<{ service?: string; vehicle?: string; desc?: string }>({});
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const push = (m: Omit<Msg, 'id'>) => setMsgs((prev) => [...prev, { ...m, id: ++idRef.current }]);

  const botSay = (text: string, extra: Partial<Msg> = {}, delay = 650) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      push({ role: 'bot', text, ...extra });
    }, delay);
  };

  useEffect(() => {
    if (open && !started.current) {
      started.current = true;
      botSay(t.agent.intro, {}, 500);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const waSummary = () =>
    waLink(
      whatsapp,
      `Bonjour Flamingo Auto Kénitra — demande via l'assistant : ${draft.current.service || '—'} / ${draft.current.vehicle || '—'} / ${draft.current.desc || '—'}`,
    );

  /** Traite un message utilisateur (intention ou étape du parcours devis). */
  const handle = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    push({ role: 'user', text });
    setInput('');

    if (step === 'service') {
      const match = services.find((sv) => text.toLowerCase().includes(sv.toLowerCase().split(' ')[0])) || text;
      draft.current.service = match;
      setStep('vehicle');
      botSay(t.agent.answers.quoteVehicle);
      return;
    }
    if (step === 'vehicle') {
      draft.current.vehicle = text;
      setStep('desc');
      botSay(t.agent.answers.quoteDesc);
      return;
    }
    if (step === 'desc') {
      draft.current.desc = text;
      setStep('idle');
      const summary = t.agent.answers.quoteDone
        .replace('{service}', draft.current.service || '—')
        .replace('{vehicle}', draft.current.vehicle || '—')
        .replace('{desc}', draft.current.desc || '—');
      botSay(summary, { actions: true });
      return;
    }

    const intent = detectIntent(text);
    if (intent === 'quote') {
      setStep('service');
      botSay(t.agent.answers.quote, { serviceChips: true });
      return;
    }
    botSay(answerFor(intent, ctx));
  };

  const chipIntent = (label: string) => {
    push({ role: 'user', text: label });
    const idx = t.agent.chips.indexOf(label);
    if (idx === 0) {
      setStep('service');
      botSay(t.agent.answers.quote, { serviceChips: true });
    } else if (idx === 1) {
      botSay(answerFor('services', ctx));
    } else if (idx === 2) {
      botSay(answerFor('location', ctx), { actions: true });
    } else {
      botSay(answerFor('promo', ctx));
    }
  };

  return (
    <>
      {/* ——— fenêtre de l'agent ——— */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="card-glass fixed bottom-24 end-4 z-50 flex h-[min(70vh,34rem)] w-[min(92vw,24rem)] flex-col overflow-hidden !rounded-2xl shadow-lift md:end-6"
            role="dialog"
            aria-label={t.agent.label}
          >
            {/* en-tête */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-ink-900/80 px-4 py-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-flame-500 to-flame-700">
                <LogoMark size={22} />
                <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 border-2 border-ink-900 bg-[#25D366]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display truncate text-sm font-black uppercase tracking-wide text-white">{t.agent.label}</p>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#25D366]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#25D366]" aria-hidden /> {t.agent.online}
                </p>
              </div>
              <a
                href={waLink(whatsapp, 'Bonjour Flamingo Auto Kénitra, je souhaite un devis.')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.agent.waContinue}
                title={t.agent.waContinue}
                className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-[#25D366] transition hover:bg-[#25D366]/10"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-steel-300 transition hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m) => (
                <div key={m.id} className={cx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cx(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      m.role === 'user'
                        ? 'rounded-br-sm bg-gradient-to-b from-flame-500 to-flame-600 text-white'
                        : 'rounded-bl-sm border border-white/10 bg-ink-800/90 text-steel-200',
                    )}
                  >
                    {m.text}
                    {m.actions && (
                      <span className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={waSummary()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-[#1EBE5A]"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" /> {t.agent.waContinue}
                        </a>
                        <a
                          href={`tel:${phoneRaw}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white transition hover:border-flame-500/50"
                        >
                          <PhoneCall className="h-3.5 w-3.5 text-flame-500" /> {t.agent.call}
                        </a>
                      </span>
                    )}
                    {m.serviceChips && (
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {services.map((sv) => (
                          <button
                            key={sv}
                            onClick={() => handle(sv)}
                            className="border border-flame-500/40 bg-flame-500/10 px-3 py-1.5 text-[11px] font-bold text-flame-300 transition hover:bg-flame-500/20 hover:text-white"
                          >
                            {sv}
                          </button>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-ink-800/90 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-steel-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      />
                    ))}
                    <span className="ms-1 text-[10px] font-bold uppercase tracking-wider text-steel-500">{t.agent.typing}</span>
                  </div>
                </div>
              )}
            </div>

            {/* chips rapides */}
            {step === 'idle' && (
              <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-4 pt-3">
                {t.agent.chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => chipIntent(c)}
                    className="border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-steel-200 transition hover:border-flame-500/50 hover:text-white"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {step === 'service' && (
              <p className="border-t border-white/10 px-4 pt-3 text-[11px] font-bold uppercase tracking-wider text-flame-400">{t.agent.chooseService}</p>
            )}

            {/* saisie */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handle(input);
              }}
              className="flex items-center gap-2 px-4 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.agent.inputPh}
                className="field !py-2.5 text-sm"
                aria-label={t.agent.inputPh}
              />
              <button
                type="submit"
                aria-label={t.agent.send}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-flame-500 to-flame-600 text-white shadow-red transition hover:brightness-110 rtl:rotate-180"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ——— icône WhatsApp flottante (ouvre l'agent) ——— */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={t.agent.label}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 260, damping: 18 }}
        className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-transform hover:scale-105"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" aria-hidden />
        {open ? <X className="relative h-6 w-6" /> : <WhatsAppIcon className="relative h-7 w-7" />}
        {!open && (
          <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-flame-500 text-[10px] font-black text-white shadow-red" aria-hidden>
            1
          </span>
        )}
      </motion.button>
    </>
  );
}
