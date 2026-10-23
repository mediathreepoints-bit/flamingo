import type { Dict, Locale } from './i18n';
import type { Promotion } from './types';

/** Mots-clés multi-langues par intention (l'utilisateur peut écrire dans n'importe quelle langue). */
const KEYWORDS: Record<string, string[]> = {
  promo: ['promo', 'offre', 'offer', 'réouverture', 'reouverture', 'reopening', 'remise', 'discount', 'reduction', '-30', '30%', 'عرض', 'تخفيض', 'خصم', 'افتتاح'],
  quote: ['devis', 'quote', 'estimation', 'prix', 'price', 'combien', 'how much', 'cost', 'تقدير', 'سعر', 'ثمن', 'كم'],
  location: ['adresse', 'address', 'où', 'where', 'localisation', 'map', 'maps', 'itinéraire', 'itineraire', 'عنوان', 'أين', 'الموقع', 'خريطة'],
  phone: ['téléphone', 'telephone', 'phone', 'appeler', 'call', 'numéro', 'numero', 'number', 'هاتف', 'اتصال', 'رقم', 'اتصل'],
  hours: ['horaire', 'heures', 'hours', 'ouvert', 'open', 'fermé', 'ferme', 'closed', 'closing', 'weekend', 'وقت', 'ساعات', 'دوام', 'مفتوح'],
  thanks: ['merci', 'thanks', 'thank', 'shukran', 'شكرا', 'شكرًا'],
  services: ['service', 'prestation', 'spécialite', 'specialty', 'réparation', 'reparation', 'repair', 'carrosserie', 'peinture', 'paint', 'polissage', 'polish', 'vitrage', 'glass', 'plastiques', 'pièces', 'pieces', 'intérieur', 'interior', 'petites', 'خدمة', 'خدمات', 'إصلاح', 'صباغة', 'طلاء', 'تلميع'],
  greet: ['bonjour', 'bonsoir', 'salut', 'coucou', 'hello', 'hey', 'salam', 'سلام', 'مرحبا', 'صباح', 'مساء'],
};

export type AgentIntent = keyof typeof KEYWORDS | 'fallback';

export function detectIntent(input: string): AgentIntent {
  const q = input.toLowerCase().trim();
  if (!q) return 'fallback';
  const order: (keyof typeof KEYWORDS)[] = ['promo', 'quote', 'location', 'phone', 'hours', 'thanks', 'services', 'greet'];
  for (const intent of order) {
    if (KEYWORDS[intent].some((k) => q.includes(k))) return intent;
  }
  return 'fallback';
}

export interface AgentCtx {
  locale: Locale;
  t: Dict;
  phone: string;
  services: string[];
  promo: Promotion | null;
}

const fmtDate = (d: string) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

/** Fabrique la réponse de l'agent pour une intention donnée. */
export function answerFor(intent: AgentIntent, ctx: AgentCtx): string {
  const a = ctx.t.agent.answers;
  const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  switch (intent) {
    case 'greet':
      return a.greet;
    case 'services':
      return fill(a.services, { services: ctx.services.join(' · ') });
    case 'quote':
      return a.quote;
    case 'location':
      return fill(a.location, { phone: ctx.phone });
    case 'phone':
      return fill(a.phone, { phone: ctx.phone });
    case 'hours':
      return fill(a.hours, { phone: ctx.phone });
    case 'thanks':
      return a.thanks;
    case 'promo':
      if (ctx.promo) {
        const dates = [ctx.promo.start, ctx.promo.end].filter(Boolean).map(fmtDate).join(' → ');
        return fill(a.promoActive, { promo: `-${ctx.promo.percent}%`, dates, terms: ctx.promo.terms || '—' });
      }
      return a.promoNone;
    default:
      return a.fallback;
  }
}
