-- Run after 202611180005_stripe_billing.sql.
alter table public.billing_profiles drop constraint if exists billing_profiles_plan_check;
alter table public.billing_profiles add constraint billing_profiles_plan_check check(plan in ('starter','free','pro','agency','past_due'));
alter table public.billing_profiles add column if not exists dodo_customer_id text;
alter table public.billing_profiles add column if not exists dodo_subscription_id text unique;
alter table public.billing_profiles add column if not exists billing_provider text;
create index if not exists billing_profiles_dodo_subscription_idx on public.billing_profiles(dodo_subscription_id);
