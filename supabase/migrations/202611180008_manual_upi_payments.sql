-- Manual agency-owned UPI QR payment support.
alter table public.deals add column if not exists payment_method text not null default 'auto' check (payment_method in ('auto','manual_upi'));
alter table public.deals add column if not exists upi_qr_path text;
alter table public.deals add column if not exists payment_notified_at timestamptz;
alter table public.deals add column if not exists currency text not null default 'USD';
-- Keep existing status vocabulary and add 'paid' where needed.
alter table public.audit_log drop constraint if exists audit_log_action_check;
alter table public.audit_log add constraint audit_log_action_check check (action in ('created','viewed','signed','uploaded','payment_notified','paid'));
