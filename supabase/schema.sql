-- SignDealDocs schema. Run in the Supabase SQL editor.
-- Safe to re-run: adds missing columns and refreshes policies.

create extension if not exists pgcrypto;

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  slug text unique not null,
  client_name text not null,
  client_email text not null,
  project_title text not null,
  currency text not null default 'USD',
  amount numeric not null default 0,
  status text not null default 'draft',
  signature_url text,
  signed_at timestamptz,
  proposal text,
  required_documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.deals add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.deals add column if not exists slug text;
alter table public.deals add column if not exists client_name text;
alter table public.deals add column if not exists client_email text;
alter table public.deals add column if not exists project_title text;
alter table public.deals add column if not exists currency text default 'USD';
alter table public.deals add column if not exists amount numeric default 0;
alter table public.deals add column if not exists status text default 'draft';
alter table public.deals add column if not exists signature_url text;
alter table public.deals add column if not exists signed_at timestamptz;
alter table public.deals add column if not exists proposal text;
alter table public.deals add column if not exists required_documents jsonb default '[]'::jsonb;
alter table public.deals add column if not exists created_at timestamptz default now();

create unique index if not exists deals_slug_key on public.deals (slug);

create table if not exists public.deal_documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references public.deals (id) on delete cascade,
  document_label text not null,
  file_name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

alter table public.deal_documents add column if not exists deal_id uuid references public.deals (id) on delete cascade;
alter table public.deal_documents add column if not exists document_label text;
alter table public.deal_documents add column if not exists file_name text;
alter table public.deal_documents add column if not exists file_url text;
alter table public.deal_documents add column if not exists created_at timestamptz default now();

alter table public.deals enable row level security;
alter table public.deal_documents enable row level security;

create or replace function public.protect_deal_client_update()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and auth.uid() = old.user_id then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
     or new.slug is distinct from old.slug
     or new.client_name is distinct from old.client_name
     or new.client_email is distinct from old.client_email
     or new.project_title is distinct from old.project_title
     or new.currency is distinct from old.currency
     or new.amount is distinct from old.amount
     or new.proposal is distinct from old.proposal
     or new.required_documents is distinct from old.required_documents
     or new.created_at is distinct from old.created_at
     or new.id is distinct from old.id
  then
    raise exception 'Clients may only update signature and status';
  end if;

  if old.status = 'sent' and new.status not in ('signed', 'completed') then
    raise exception 'Invalid status transition';
  end if;
  if old.status = 'signed' and new.status not in ('signed', 'completed') then
    raise exception 'Invalid status transition';
  end if;
  if old.status = 'completed' and new.status <> 'completed' then
    raise exception 'Invalid status transition';
  end if;
  if old.status = 'draft' then
    raise exception 'Draft deals cannot be updated from the client portal';
  end if;

  return new;
end;
$$;

drop trigger if exists deals_protect_client_update on public.deals;
create trigger deals_protect_client_update
  before update on public.deals
  for each row
  execute function public.protect_deal_client_update();

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='deals'
  loop execute format('drop policy %I on public.deals', p.policyname); end loop;
end $$;

create policy "owners read deals" on public.deals for select to authenticated
  using (auth.uid() = user_id);
create policy "owners insert deals" on public.deals for insert to authenticated
  with check (auth.uid() = user_id);
create policy "owners update deals" on public.deals for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='deal_documents'
  loop execute format('drop policy %I on public.deal_documents', p.policyname); end loop;
end $$;

create policy "owners read documents" on public.deal_documents for select to authenticated
  using (exists (select 1 from public.deals d where d.id = deal_id and d.user_id = auth.uid()));

  on public.deals for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "public read deals"
  on public.deals for select
  to anon
  using (true);

create policy "public update deals"
  on public.deals for update
  to anon
  using (status in ('sent', 'signed', 'completed'))
  with check (status in ('signed', 'completed'));

drop policy if exists "owners read documents" on public.deal_documents;
drop policy if exists "public read documents" on public.deal_documents;
drop policy if exists "public insert documents" on public.deal_documents;

create policy "owners read documents"
  on public.deal_documents for select
  to authenticated
  using (
    exists (
      select 1 from public.deals d
      where d.id = deal_id and d.user_id = auth.uid()
    )
  );

create policy "public read documents"
  on public.deal_documents for select
  to anon
  using (true);

create policy "public insert documents"
  on public.deal_documents for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.deals d
      where d.id = deal_id and d.status in ('signed', 'completed')
    )
  );

insert into storage.buckets (id, name, public)
values ('deal-vault', 'deal-vault', false)
on conflict (id) do update set public = false;

drop policy if exists "deal vault upload" on storage.objects;
drop policy if exists "deal vault read" on storage.objects;
