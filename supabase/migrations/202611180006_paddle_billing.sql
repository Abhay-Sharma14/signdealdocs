alter table public.billing_profiles add column if not exists paddle_customer_id text unique;
alter table public.billing_profiles add column if not exists paddle_subscription_id text unique;
alter table public.billing_profiles add column if not exists billing_provider text;
alter table public.billing_profiles add column if not exists paddle_event_at timestamptz;
create table if not exists public.paddle_webhook_events(event_id text primary key,received_at timestamptz not null default now());
alter table public.paddle_webhook_events enable row level security;
revoke all on public.paddle_webhook_events from anon,authenticated;
create or replace function public.apply_paddle_billing_event(p_event_id text,p_user_id uuid,p_plan text,p_customer_id text,p_subscription_id text,p_status text,p_occurred_at timestamptz)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_previous timestamptz;
begin
 if p_plan not in ('starter','pro','agency') then raise exception 'Invalid plan'; end if;
 insert into public.paddle_webhook_events(event_id) values(p_event_id) on conflict do nothing;
 if not found then return false; end if;
 select paddle_event_at into v_previous from public.billing_profiles where user_id=p_user_id for update;
 if v_previous is not null and p_occurred_at<v_previous then return false; end if;
 insert into public.billing_profiles(user_id,plan,paddle_customer_id,paddle_subscription_id,subscription_status,billing_provider,paddle_event_at,updated_at)
 values(p_user_id,p_plan,p_customer_id,p_subscription_id,p_status,'paddle',p_occurred_at,now())
 on conflict(user_id) do update set plan=excluded.plan,paddle_customer_id=excluded.paddle_customer_id,paddle_subscription_id=excluded.paddle_subscription_id,subscription_status=excluded.subscription_status,billing_provider='paddle',paddle_event_at=excluded.paddle_event_at,updated_at=now();
 return true;
end; $$;
revoke all on function public.apply_paddle_billing_event(text,uuid,text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.apply_paddle_billing_event(text,uuid,text,text,text,text,timestamptz) to service_role;
