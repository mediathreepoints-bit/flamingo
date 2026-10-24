'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Eye } from 'lucide-react';
import { PageHeader, useToast } from './ui';
import type { SiteSettings } from '@/lib/site';
import { apiUrl, PHP_MODE } from '@/lib/client-env';

const GROUPS: { title: string; fields: { key: keyof SiteSettings; label: string; hint?: string; wide?: boolean; arabic?: boolean }[] }[] = [
  {
    title: 'Identité',
    fields: [
      { key: 'brand', label: 'Nom de la marque' },
      { key: 'city', label: 'Ville (affichage)' },
      { key: 'legal', label: 'Mentions légales (pied de page)', wide: true },
    ],
  },
  {
    title: 'Coordonnées',
    fields: [
      { key: 'phone', label: 'Téléphone (affichage)', hint: 'Ex. 0661 50 86 74' },
      { key: 'phoneRaw', label: 'Téléphone (format international)', hint: 'Ex. +212661508674 — utilisé pour les liens tel:' },
      { key: 'whatsapp', label: 'Numéro WhatsApp', hint: 'Format international sans + (ex. 212661508674)' },
      { key: 'instagram', label: 'URL Instagram' },
      { key: 'instagramHandle', label: 'Pseudo Instagram (affichage)' },
    ],
  },
  {
    title: 'Section héro (page d’accueil)',
    fields: [
      { key: 'heroEyebrow', label: 'Surtitre', wide: true },
      { key: 'heroTitle1', label: 'Titre — ligne 1' },
      { key: 'heroTitle2', label: 'Titre — ligne 2 (en rouge)' },
      { key: 'heroSubtitle', label: 'Sous-titre', wide: true },
      { key: 'sloganFr', label: 'Slogan (français)', wide: true },
      { key: 'sloganAr', label: 'Slogan (arabe)', wide: true, arabic: true },
    ],
  },
  {
    title: 'Localisation',
    fields: [
      { key: 'mapUrl', label: 'Lien Google Maps (bouton)', wide: true, hint: 'Vérifiez le lien avant publication' },
      { key: 'mapEmbed', label: 'URL d’embed Google Maps (page contact)', wide: true },
    ],
  },
];

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const toast = useToast();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  // variante export PHP : recharge les réglages enregistrés côté serveur
  useEffect(() => {
    if (!PHP_MODE) return;
    fetch(apiUrl('/api/admin/settings'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j?.settings) setForm(j.settings); })
      .catch(() => { /* garder les réglages initiaux */ });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur');
      toast('Contenu du site mis à jour');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Contenu du site"
        subtitle="Textes, coordonnées et slogans affichés sur le site public. Les modifications sont immédiates."
        action={
          <motion.button form="settings-form" type="submit" disabled={busy} animate={saved ? { scale: [1, 1.06, 1] } : {}} className="btn-primary">
            {saved ? <><Eye className="h-4 w-4" /> En ligne</> : <><Save className="h-4 w-4" /> {busy ? 'Enregistrement…' : 'Publier les modifications'}</>}
          </motion.button>
        }
      />

      <form id="settings-form" onSubmit={save} className="space-y-8">
        {GROUPS.map((g) => (
          <section key={g.title} className="card p-6">
            <h2 className="font-display mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-mega text-white">
              <Globe className="h-4 w-4 text-flame-500" /> {g.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.fields.map((f) => (
                <div key={String(f.key)} className={f.wide ? 'sm:col-span-2' : ''}>
                  <label htmlFor={`s-${String(f.key)}`} className="label">{f.label}</label>
                  {f.wide ? (
                    <textarea
                      id={`s-${String(f.key)}`}
                      rows={2}
                      dir={f.arabic ? 'rtl' : 'ltr'}
                      className={`field resize-none ${f.arabic ? 'font-ar' : ''}`}
                      value={form[f.key] || ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      id={`s-${String(f.key)}`}
                      dir={f.arabic ? 'rtl' : 'ltr'}
                      className={`field ${f.arabic ? 'font-ar' : ''}`}
                      value={form[f.key] || ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  )}
                  {f.hint && <p className="mt-1 text-[11px] text-steel-500">{f.hint}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </form>
    </div>
  );
}
