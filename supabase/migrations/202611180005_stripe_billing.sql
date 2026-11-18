-- Subscription state is owned by verified Stripe webhooks, never the browser.
create table if not exists public.billing_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 plan text not null default 'starter' check (plan in ('starter','pro','agency')),
 stripe_customer_id text unique,
 stripe_subscription_id text unique,
 subscription_status text,
 updated_at timestamptz not null default now()
);
alter table public.billing_profiles enable row level security;
drop policy if exists "billing owner read" on public.billing_profiles;
create policy "billing owner read" on public.billing_profiles for select to authenticated using (auth.uid()=user_id);
revoke insert,update,delete on public.billing_profiles from anon,authenticated;
create table if not exists public.stripe_webhook_events (
 event_id text primary key,
 received_at timestamptz not null default now()
);
alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from anon,authenticated;
-- Serialize webhook delivery via the event ID and a DB function.
create or replace function public.apply_stripe_billing_event(
 p_event_id text,p_user_id uuid,p_plan text,p_customer_id text,p_subscription_id text,p_status text
) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if p_plan not in ('starter','pro','agency') then raise exception 'Invalid plan'; end if;
 insert into public.stripe_webhook_events(event_id) values(p_event_id) on conflict do nothing;
 if not found then return false; end if;
 insert into public.billing_profiles(user_id,plan,stripe_customer_id,stripe_subscription_id,subscription_status,updated_at)
 values(p_user_id,p_plan,p_customer_id,p_subscription_id,p_status,now())
 on conflict(user_id) do update set plan=excluded.plan,stripe_customer_id=coalesce(excluded.stripe_customer_id,public.billing_profiles.stripe_customer_id),stripe_subscription_id=coalesce(excluded.stripe_subscription_id,public.billing_profiles.stripe_subscription_id),subscription_status=excluded.subscription_status,updated_at=now();
 return true;
end; $$;
revoke all on function public.apply_stripe_billing_event(text,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.apply_stripe_billing_event(text,uuid,text,text,text,text) to service_role;
