-- Security hardening migration for the demo MVP.
-- Public deal links are handled by server routes using the high-entropy slug as a
-- bearer capability. Anonymous clients must never query or mutate tables/storage directly.

begin;

alter table public.deals enable row level security;
alter table public.deal_documents enable row level security;

-- Permit the server-controlled one-step completion when a deal has no required documents.
create or replace function public.protect_deal_client_update()
returns trigger
language plpgsql
as $func$
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
$func$;

-- Ensure the client-update guard is installed even on databases created manually.
drop trigger if exists deals_protect_client_update on public.deals;
create trigger deals_protect_client_update
  before update on public.deals
  for each row
  execute function public.protect_deal_client_update();

-- Remove every existing table policy first: permissive policies combine with OR.
do $block$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('deals', 'deal_documents')
  loop
    execute format('drop policy %I on %I.%I',
      policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end;
$block$;

-- Remove all legacy anonymous policies (including broad public reads and writes).
drop policy if exists "public read deals" on public.deals;
drop policy if exists "public update deals" on public.deals;
drop policy if exists "public read documents" on public.deal_documents;
drop policy if exists "public insert documents" on public.deal_documents;

-- Keep authenticated owners scoped to their own deals and documents.
drop policy if exists "owners read deals" on public.deals;
drop policy if exists "owners insert deals" on public.deals;
drop policy if exists "owners update deals" on public.deals;
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
create policy "owners read documents"
  on public.deal_documents for select to authenticated
  using (
    exists (
      select 1 from public.deals d
      where d.id = deal_id and d.user_id = auth.uid()
    )
  );


-- Protect paid/limited AI provider usage with an atomic per-user hourly quota.
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

-- The server uses the service role for controlled portal operations. Do not expose
-- direct storage access to anon/authenticated browser clients.
update storage.buckets
set public = false
where id = 'deal-vault';

drop policy if exists "deal vault upload" on storage.objects;
drop policy if exists "deal vault read" on storage.objects;

commit;
