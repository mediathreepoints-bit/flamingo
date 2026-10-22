/* Modèle de données — FLAMINGO AUTO KÉNITRA */

export type ID = string;

export type RepairStatus =
  | 'diagnostic' | 'devis' | 'pieces' | 'tolerie' | 'peinture' | 'polissage' | 'controle' | 'livre';

export const REPAIR_FLOW: RepairStatus[] = [
  'diagnostic', 'devis', 'pieces', 'tolerie', 'peinture', 'polissage', 'controle', 'livre',
];

export const REPAIR_STATUS_META: Record<RepairStatus, { label: string; color: string }> = {
  diagnostic: { label: 'Diagnostic', color: '#939CAB' },
  devis: { label: 'Devis en cours', color: '#F04438' },
  pieces: { label: 'Attente pièces', color: '#F59E0B' },
  tolerie: { label: 'Tôlerie', color: '#F97316' },
  peinture: { label: 'Peinture', color: '#F04438' },
  polissage: { label: 'Polissage', color: '#38BDF8' },
  controle: { label: 'Contrôle qualité', color: '#A78BFA' },
  livre: { label: 'Livré', color: '#22C55E' },
};

export type QuoteStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'facture';
export const QUOTE_STATUS_META: Record<QuoteStatus, { label: string; color: string }> = {
  brouillon: { label: 'Brouillon', color: '#939CAB' },
  envoye: { label: 'Envoyé', color: '#38BDF8' },
  accepte: { label: 'Accepté', color: '#22C55E' },
  refuse: { label: 'Refusé', color: '#EF4444' },
  facture: { label: 'Facturé', color: '#A78BFA' },
};

export type InvoiceStatus = 'emise' | 'partielle' | 'payee' | 'en_retard';
export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; color: string }> = {
  emise: { label: 'Émise', color: '#38BDF8' },
  partielle: { label: 'Partiellement payée', color: '#F59E0B' },
  payee: { label: 'Payée', color: '#22C55E' },
  en_retard: { label: 'En retard', color: '#EF4444' },
};

export type PaymentMethod = 'especes' | 'carte' | 'virement' | 'cheque';
export const PAYMENT_METHOD_META: Record<PaymentMethod, string> = {
  especes: 'Espèces', carte: 'Carte bancaire', virement: 'Virement', cheque: 'Chèque',
};

export type AppointmentType = 'devis' | 'depot' | 'expertise' | 'livraison' | 'rdv';
export const APPOINTMENT_TYPE_META: Record<AppointmentType, { label: string; color: string }> = {
  devis: { label: 'Rendez-vous devis', color: '#38BDF8' },
  depot: { label: 'Dépôt véhicule', color: '#F59E0B' },
  expertise: { label: 'Expertise', color: '#A78BFA' },
  livraison: { label: 'Livraison', color: '#22C55E' },
  rdv: { label: 'Atelier', color: '#F04438' },
};

export type RepairCategory = 'carrosserie' | 'peinture' | 'polissage' | 'renovation';

export const CATEGORIES: { id: RepairCategory; label: string }[] = [
  { id: 'carrosserie', label: 'Carrosserie' },
  { id: 'peinture', label: 'Peinture au four' },
  { id: 'polissage', label: 'Polissage' },
  { id: 'renovation', label: 'Rénovation automobile' },
];

export interface Customer { id: ID; nom: string; telephone: string; email?: string; ville?: string; adresse?: string; notes?: string; createdAt: string; }
export interface Vehicle { id: ID; customerId: ID; marque: string; modele: string; annee: number; immatriculation: string; couleur?: string; kilometrage?: number; notes?: string; }
export interface RepairEvent { at: string; status: RepairStatus; note?: string; }
export interface Repair { id: ID; ref: string; customerId: ID; vehicleId: ID; status: RepairStatus; category: RepairCategory; description: string; priority: 'normale' | 'haute' | 'urgente'; estimatedAmount?: number; startDate?: string; dueDate?: string; deliveredDate?: string; createdAt: string; history: RepairEvent[]; }
export interface LineItem { id: ID; label: string; qty: number; unit: string; price: number; }
export interface Quote { id: ID; ref: string; customerId?: ID; vehicleId?: ID; customerName?: string; customerPhone?: string; items: LineItem[]; discount: number; tva: number; status: QuoteStatus; source: 'atelier' | 'site' | 'whatsapp'; createdAt: string; validUntil?: string; notes?: string; }
export interface Invoice { id: ID; ref: string; customerId: ID; vehicleId?: ID; repairId?: ID; quoteId?: ID; items: LineItem[]; discount: number; tva: number; status: InvoiceStatus; issuedAt: string; dueAt?: string; notes?: string; }
export interface Payment { id: ID; customerId: ID; invoiceId?: ID; repairId?: ID; amount: number; method: PaymentMethod; type: 'acompte' | 'solde' | 'paiement'; date: string; notes?: string; }
export interface Appointment { id: ID; date: string; start: string; end: string; type: AppointmentType; status: 'confirme' | 'en_attente' | 'annule'; name: string; phone: string; vehicleLabel?: string; notes?: string; }
export interface GalleryItem { id: ID; title: string; vehicle: string; category: RepairCategory; beforeImage: string; afterImage: string; description?: string; demo?: boolean; featured?: boolean; year: number; }
export interface QuoteRequest { id: ID; name: string; phone: string; brand: string; model: string; year: string; repairType: string; message?: string; photos: string[]; createdAt: string; status: 'nouveau' | 'traite' | 'converti'; }
export interface ContactMessage { id: ID; name: string; email?: string; phone?: string; message: string; createdAt: string; status: 'nouveau' | 'traite'; }

export interface Promotion {
  id: string;
  title: string;
  percent: number;
  services: string[];
  start: string; // ISO (YYYY-MM-DD) ou ''
  end: string;
  terms: string;
  active: boolean;
  createdAt?: string;
}

export interface ServiceContent {
  id: string;
  image?: string;
  fr?: { title?: string; desc?: string; sub?: string };
  en?: { title?: string; desc?: string; sub?: string };
  ar?: { title?: string; desc?: string; sub?: string };
}

export interface DB {
  customers: Customer[];
  vehicles: Vehicle[];
  repairs: Repair[];
  quotes: Quote[];
  invoices: Invoice[];
  payments: Payment[];
  appointments: Appointment[];
  gallery: GalleryItem[];
  quoteRequests: QuoteRequest[];
  messages: ContactMessage[];
  promotions: Promotion[];
  services: ServiceContent[];
  settings: Record<string, string>;
}

export const emptyDB = (): DB => ({
  customers: [], vehicles: [], repairs: [], quotes: [], invoices: [],
  payments: [], appointments: [], gallery: [], quoteRequests: [], messages: [],
  promotions: [], services: [],
  settings: {},
});
