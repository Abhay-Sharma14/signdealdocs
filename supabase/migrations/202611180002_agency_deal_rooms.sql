-- Additive Deal Room pivot. Preserve existing deals, deal_documents and legacy links.
begin;
alter table public.deals
 add column if not exists brand_name text,
 add column if not exists brand_color text not null default '#4f46e5',
 add column if not exists logo_url text,
 add column if not exists paid_at timestamptz;
-- Legacy schema uses user_id and slug; they are owner_id and share_token semantically.
create table if not exists public.deal_items (
 id uuid primary key default gen_random_uuid(),
 deal_id uuid not null references public.deals(id) on delete cascade,
 type text not null check(type in ('proposal','contract','invoice','file_request')),
 title text not null,
 pdf_url text,
 signed_pdf_url text,
 status text not null default 'pending' check(status in ('pending','viewed','signed','uploaded')),
 sort_order integer not null default 0,
 created_at timestamptz not null default now()
);
create index if not exists deal_items_deal_sort_idx on public.deal_items(deal_id,sort_order);
create table if not exists public.deal_uploads (
 id uuid primary key default gen_random_uuid(),
 deal_item_id uuid not null references public.deal_items(id) on delete cascade,
 file_url text not null,
 file_name text not null,
 uploaded_by text not null check(uploaded_by in ('owner','client')),
 created_at timestamptz not null default now()
);
create table if not exists public.audit_log (
 id uuid primary key default gen_random_uuid(),
 deal_id uuid not null references public.deals(id) on delete cascade,
 action text not null check(action in ('created','viewed','signed','uploaded')),
 actor_email text,
 ip_address text,
 created_at timestamptz not null default now()
);
create index if not exists audit_log_deal_created_idx on public.audit_log(deal_id,created_at desc);
alter table public.deal_items enable row level security;
alter table public.deal_uploads enable row level security;
alter table public.audit_log enable row level security;
drop policy if exists "owner reads deal items" on public.deal_items;
create policy "owner reads deal items" on public.deal_items for select to authenticated
 using(exists(select 1 from public.deals d where d.id=deal_id and d.user_id=auth.uid()));
drop policy if exists "owner reads uploads" on public.deal_uploads;
create policy "owner reads uploads" on public.deal_uploads for select to authenticated
 using(exists(select 1 from public.deal_items i join public.deals d on d.id=i.deal_id where i.id=deal_item_id and d.user_id=auth.uid()));
drop policy if exists "owner reads audit" on public.audit_log;
create policy "owner reads audit" on public.audit_log for select to authenticated
 using(exists(select 1 from public.deals d where d.id=deal_id and d.user_id=auth.uid()));
-- Mutations are exclusively mediated by authenticated/token-checked server APIs.
revoke insert,update,delete on public.deal_items,public.deal_uploads,public.audit_log from anon,authenticated;
commit;
