-- Append-only signature evidence. Requires applying in Supabase SQL editor.
create table if not exists public.signature_events (
 id uuid primary key default gen_random_uuid(),
 signature_request_id uuid not null references public.signature_requests(id) on delete cascade,
 event_type text not null check (event_type in ('signed')),
 created_at timestamptz not null default now(),
 signer_name text not null,
 consent_text text not null,
 document_sha256 text not null,
 signature_sha256 text not null,
 user_agent text,
 ip_sha256 text
);
create index if not exists signature_events_request_idx on public.signature_events(signature_request_id, created_at);
alter table public.signature_events enable row level security;
drop policy if exists "signature events owner read" on public.signature_events;
create policy "signature events owner read" on public.signature_events for select to authenticated
using (exists (select 1 from public.signature_requests r where r.id=signature_request_id and r.owner_id=auth.uid()));
-- Only service role writes audit evidence; no public insert/update/delete policies.
