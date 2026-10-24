import { DB, emptyDB } from './types';
import { loadDB, saveDB, withDB } from './db';
import { supabaseAdmin, supabaseConfigured, TABLES } from './supabase';
import { uid } from './format';

export type Entity = keyof typeof TABLES;

type Rec = Record<string, any> & { id: string };

/* ————————————————————————— mode Supabase ————————————————————————— */

async function sbList<T>(entity: Entity): Promise<T[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb.from(TABLES[entity]).select('data').order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((r: any) => r.data as T);
}

async function sbCreate<T>(entity: Entity, rec: Rec): Promise<T> {
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase non configuré');
  const { error } = await sb.from(TABLES[entity]).insert({ id: rec.id, data: rec });
  if (error) throw new Error(error.message);
  return rec as T;
}

async function sbUpdate<T>(entity: Entity, id: string, patch: Record<string, unknown>): Promise<T | null> {
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase non configuré');
  const { data } = await sb.from(TABLES[entity]).select('data').eq('id', id).maybeSingle();
  if (!data) return null;
  const merged = { ...(data.data as Rec), ...patch, id };
  const { error } = await sb.from(TABLES[entity]).update({ data: merged, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);
  return merged as T;
}

async function sbRemove(entity: Entity, id: string): Promise<boolean> {
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase non configuré');
  const { error } = await sb.from(TABLES[entity]).delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/* ————————————————————————— API du dépôt ————————————————————————— */

const keyOf = (entity: Entity): keyof DB => (entity === 'gallery' ? 'gallery' : (entity as keyof DB));

export const repo = {
  mode: (): 'supabase' | 'local' => (supabaseConfigured() && supabaseAdmin() ? 'supabase' : 'local'),

  async list<T = Rec>(entity: Entity): Promise<T[]> {
    if (repo.mode() === 'supabase') return sbList<T>(entity);
    return withDB((db) => db[keyOf(entity)] as unknown as T[]);
  },

  async get<T = Rec>(entity: Entity, id: string): Promise<T | null> {
    const rows = await repo.list<T>(entity);
    return rows.find((r) => (r as Rec).id === id) || null;
  },

  async create<T = Rec>(entity: Entity, rec: Rec): Promise<T> {
    if (repo.mode() === 'supabase') return sbCreate<T>(entity, rec);
    return withDB((db) => {
      (db[keyOf(entity)] as unknown as Rec[]).unshift(rec);
      return rec as T;
    });
  },

  async update<T = Rec>(entity: Entity, id: string, patch: Record<string, unknown>): Promise<T | null> {
    if (repo.mode() === 'supabase') return sbUpdate<T>(entity, id, patch);
    return withDB((db) => {
      const list = db[keyOf(entity)] as unknown as Rec[];
      const i = list.findIndex((r) => r.id === id);
      if (i === -1) return null;
      list[i] = { ...list[i], ...patch, id };
      return list[i] as T;
    });
  },

  async remove(entity: Entity, id: string): Promise<boolean> {
    if (repo.mode() === 'supabase') return sbRemove(entity, id);
    return withDB((db) => {
      const list = db[keyOf(entity)] as unknown as Rec[];
      const i = list.findIndex((r) => r.id === id);
      if (i === -1) return false;
      list.splice(i, 1);
      return true;
    });
  },

  async settings(): Promise<Record<string, string>> {
    if (repo.mode() === 'supabase') {
      const sb = supabaseAdmin();
      if (sb) {
        const { data } = await sb.from('settings').select('data').eq('id', 'site').maybeSingle();
        if (data) return data.data as Record<string, string>;
      }
    }
    return loadDB().settings;
  },

  async saveSettings(patch: Record<string, string>) {
    if (repo.mode() === 'supabase') {
      const sb = supabaseAdmin();
      if (sb) {
        const current = await repo.settings();
        await sb.from('settings').upsert({ id: 'site', data: { ...current, ...patch }, updated_at: new Date().toISOString() });
        return;
      }
    }
    withDB((db) => {
      db.settings = { ...db.settings, ...patch };
    });
  },
};

export { uid, saveDB, emptyDB };
