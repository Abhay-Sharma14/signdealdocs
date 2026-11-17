-- Standalone PDF signature requests, separate from proposal deal rooms.
create table if not exists public.signature_requests (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 token text not null unique,
 title text not null,
 signer_name text not null,
 signer_email text not null,
 original_name text not null,
 document_path text not null,
 signature_path text,
 signed_at timestamptz,
 consent_text text,
 created_at timestamptz not null default now(),
 revoked_at timestamptz,
 expires_at timestamptz not null default (now() + interval '7 days'),
 constraint signature_request_title_length check (char_length(title) between 1 and 160)
);
create index if not exists signature_requests_owner_created_idx on public.signature_requests(owner_id,created_at desc);
alter table public.signature_requests enable row level security;
drop policy if exists "signature owners select" on public.signature_requests;
create policy "signature owners select" on public.signature_requests for select to authenticated using (owner_id=auth.uid());
-- No browser-side insert/update/delete policies; all writes use authenticated server endpoints.
