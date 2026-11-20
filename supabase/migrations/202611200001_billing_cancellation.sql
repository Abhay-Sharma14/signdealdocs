-- Keep paid access until Dodo confirms period-end cancellation.
alter table public.billing_profiles add column if not exists cancel_at_period_end boolean not null default false;
alter table public.billing_profiles add column if not exists current_period_end timestamptz;
