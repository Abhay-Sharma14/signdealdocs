-- SignDealDocs database schema.
-- Safe to run repeatedly. Public deal-room access is server-mediated only.

create extension if not exists pgcrypto;

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique,
  client_name text not null,
  client_email text not null,
  project_title text not null,
  currency text not null default 'USD',
  amount numeric(14,2) not null default 0 check (amount >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'signed', 'completed')),
  signature_url text,
  signed_at timestamptz,
  proposal text,
  required_documents jsonb not null default '[]'::jsonb
    check (jsonb_typeof(required_documents) = 'array'),
  created_at timestamptz not null default now()
);

create table if not exists public.deal_documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  document_label text not null,
  file_name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists deals_user_created_idx
  on public.deals (user_id, created_at desc);
create index if not exists deal_documents_deal_created_idx
  on public.deal_documents (deal_id, created_at asc);

alter table public.deals enable row level security;
alter table public.deal_documents enable row level security;

-- Authenticated owners may manage only their own deals. Service-role API routes
-- bypass RLS and are responsible for validating bearer links and state transitions.
drop policy if exists "owners read deals" on public.deals;
drop policy if exists "owners insert deals" on public.deals;
drop policy if exists "owners update deals" on public.deals;
drop policy if exists "public read deals" on public.deals;
drop policy if exists "public update deals" on public.deals;

create policy "owners read deals"
  on public.deals for select to authenticated
  using (auth.uid() = user_id);
create policy "owners insert deals"
  on public.deals for insert to authenticated
  with check (auth.uid() = user_id);
create policy "owners update deals"
  on public.deals for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "owners read documents" on public.deal_documents;
drop policy if exists "public read documents" on public.deal_documents;
drop policy if exists "public insert documents" on public.deal_documents;

create policy "owners read documents"
  on public.deal_documents for select to authenticated
  using (
    exists (
      select 1 from public.deals d
      where d.id = deal_id and d.user_id = auth.uid()
    )
  );


create table if not exists public.ai_proposal_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0)
);
alter table public.ai_proposal_usage enable row level security;
revoke all on public.ai_proposal_usage from anon, authenticated;

create or replace function public.consume_ai_proposal_quota(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $quota$
declare
  v_count integer;
  v_window timestamptz := date_trunc('hour', now());
begin
  insert into public.ai_proposal_usage(user_id, window_start, request_count)
  values (p_user_id, v_window, 1)
  on conflict (user_id) do update
    set window_start = case
          when public.ai_proposal_usage.window_start < v_window then v_window
          else public.ai_proposal_usage.window_start
        end,
        request_count = case
          when public.ai_proposal_usage.window_start < v_window then 1
          else public.ai_proposal_usage.request_count + 1
        end
  returning request_count into v_count;

  return v_count <= 10;
end;
$quota$;

revoke all on function public.consume_ai_proposal_quota(uuid) from public, anon, authenticated;
grant execute on function public.consume_ai_proposal_quota(uuid) to service_role;

-- Remove legacy storage policies. The application server uses a server-only
-- service-role client and creates short-lived signed URLs for authorized access.
drop policy if exists "deal vault upload" on storage.objects;
drop policy if exists "deal vault read" on storage.objects;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deal-vault',
  'deal-vault',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;
