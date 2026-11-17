-- Phase 1: owner-controlled client-link expiry and revocation.
-- Apply in Supabase SQL Editor before using the new controls.
begin;
alter table public.deals
  add column if not exists link_expires_at timestamptz,
  add column if not exists link_revoked_at timestamptz;
create index if not exists deals_link_expiry_idx on public.deals(link_expires_at)
  where link_expires_at is not null;
-- Existing links remain active until explicitly expired/revoked.
-- Only the owner may change link settings through the authenticated owner API.
commit;
