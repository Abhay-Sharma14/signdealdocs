-- Security hardening migration for the demo MVP.
-- Public deal links are handled by server routes using the high-entropy slug as a
-- bearer capability. Anonymous clients must never query or mutate tables/storage directly.

begin;

alter table public.deals enable row level security;
alter table public.deal_documents enable row level security;

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

-- The server uses the service role for controlled portal operations. Do not expose
-- direct storage access to anon/authenticated browser clients.
update storage.buckets
set public = false
where id = 'deal-vault';

drop policy if exists "deal vault upload" on storage.objects;
drop policy if exists "deal vault read" on storage.objects;

commit;
