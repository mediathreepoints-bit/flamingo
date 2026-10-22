-- ============================================================================
--  FLAMINGO AUTO KÉNITRA — schéma Supabase + Row Level Security
--  Exécutez ce script dans SQL Editor de votre projet Supabase,
--  puis renseignez NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
--  (et SUPABASE_ANON_KEY) dans votre hébergeur.
--  Sans ces variables, le site bascule automatiquement sur le
--  datastore JSON local (même API, mêmes écrans admin).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ——— profil administrateur ———
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin);
$$;

-- ——— tables métier (données en jsonb : schéma souple, identique au mode local) ———
create table if not exists public.customers     (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.vehicles      (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.repair_jobs   (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.quotes        (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.invoice_items (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.invoices      (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.payments      (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.appointments  (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.gallery_items (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.quote_requests(id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.messages      (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.settings      (id text primary key default 'site', data jsonb not null, updated_at timestamptz not null default now());

-- ——— Row Level Security ———
alter table public.profiles      enable row level security;
alter table public.customers     enable row level security;
alter table public.vehicles      enable row level security;
alter table public.repair_jobs   enable row level security;
alter table public.quotes        enable row level security;
alter table public.invoices      enable row level security;
alter table public.payments      enable row level security;
alter table public.appointments  enable row level security;
alter table public.gallery_items enable row level security;
alter table public.quote_requests enable row level security;
alter table public.messages      enable row level security;
alter table public.settings      enable row level security;

-- profil : lecture de soi-même
create policy "profiles self read" on public.profiles for select using (id = auth.uid());

-- données privées : réservées aux administrateurs (aucune fuite publique)
do $$
declare t text;
begin
  foreach t in array array['customers','vehicles','repair_jobs','quotes','invoices','payments','appointments','messages']
  loop
    execute format('create policy "admin all on %I" on public.%I for all using (public.is_admin()) with check (public.is_admin());', t, t);
  end loop;
end $$;

-- galerie & réglages : lecture publique (contenu du site), écriture admin
create policy "gallery public read"  on public.gallery_items for select using (true);
create policy "gallery admin write"  on public.gallery_items for all using (public.is_admin()) with check (public.is_admin());
create policy "settings public read" on public.settings for select using (true);
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- demandes de devis / messages : insertion anonyme (formulaire public), lecture admin
create policy "quote requests anon insert" on public.quote_requests for insert with check (true);
create policy "quote requests admin all"   on public.quote_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "messages anon insert"       on public.messages for insert with check (true);
create policy "messages admin all"         on public.messages for all using (public.is_admin()) with check (public.is_admin());

-- ——— storage : galerie (publique en lecture) + photos de dommages (privées) ———
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true)  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('damage-photos', 'damage-photos', false) on conflict (id) do nothing;

create policy "gallery objects public read" on storage.objects for select
  using (bucket_id = 'gallery');
create policy "gallery objects admin write" on storage.objects for insert
  with check (bucket_id = 'gallery' and public.is_admin());
create policy "gallery objects admin delete" on storage.objects for delete
  using (bucket_id = 'gallery' and public.is_admin());
create policy "damage objects admin read" on storage.objects for select
  using (bucket_id = 'damage-photos' and public.is_admin());
create policy "damage objects anon upload" on storage.objects for insert
  with check (bucket_id = 'damage-photos');

-- ——— amorçage : réglages du site (infos officielles uniquement) ———
insert into public.settings (id, data) values ('site', jsonb_build_object(
  'brand', 'FLAMINGO AUTO',
  'city', 'KÉNITRA',
  'phone', '0661 50 86 74',
  'phoneRaw', '+212661508674',
  'whatsapp', '212661508674',
  'instagram', 'https://www.instagram.com/flamingo_auto_kenitra/',
  'instagramHandle', '@flamingo_auto_kenitra',
  'sloganFr', 'Votre confiance, notre responsabilité.',
  'sloganAr', 'ثقتكم مسؤوليتنا',
  'heroTitle1', 'UNE NOUVELLE ÉQUIPE.',
  'heroTitle2', 'UN NOUVEL ÉLAN.',
  'heroSubtitle', 'Carrosserie • Peinture au four • Polissage & Rénovation à Kénitra',
  'mapUrl', 'https://www.google.com/maps/search/?api=1&query=K%C3%A9nitra%2C%20Maroc',
  'mapEmbed', 'https://www.google.com/maps?q=K%C3%A9nitra%2C%20Maroc&z=12&output=embed',
  'legal', 'FLAMINGO AUTO KÉNITRA — Kénitra, Maroc'
)) on conflict (id) do nothing;

-- ——— premier administrateur : à exécuter manuellement après création
--     de l'utilisateur dans Authentication → Users :
-- update public.profiles set is_admin = true where id = '<uuid-de-l-utilisateur>';
-- (un trigger peut créer automatiquement la ligne profile : voir documentation)

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, is_admin) values (new.id, false) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
