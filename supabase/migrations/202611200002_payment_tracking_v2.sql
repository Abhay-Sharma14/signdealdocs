-- Payment reports are claims, not proof of settlement. Agency alone confirms payment.
alter table public.deals add column if not exists payment_reference text;
alter table public.deals add column if not exists payment_reported_method text;
-- Existing payment_notified_at and paid_at record report and verification times.
-- No card details, payment credentials or screenshots are stored.
