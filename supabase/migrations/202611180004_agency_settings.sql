-- Per-owner agency branding. Run once in Supabase SQL Editor.
create table if not exists public.agency_settings (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 agency_name text not null,
 brand_color text not null default '#4f46e5',
 logo_url text,
 updated_at timestamptz not null default now(),
 constraint agency_settings_name_length check (char_length(agency_name) between 1 and 100),
 constraint agency_settings_color_hex check (brand_color ~ '^#[0-9a-fA-F]{6}$')
);
alter table public.agency_settings enable row level security;
drop policy if exists "agency owner can read settings" on public.agency_settings;
create policy "agency owner can read settings" on public.agency_settings for select to authenticated using (owner_id=auth.uid());
drop policy if exists "agency owner can insert settings" on public.agency_settings;
create policy "agency owner can insert settings" on public.agency_settings for insert to authenticated with check (owner_id=auth.uid());
drop policy if exists "agency owner can update settings" on public.agency_settings;
create policy "agency owner can update settings" on public.agency_settings for update to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
