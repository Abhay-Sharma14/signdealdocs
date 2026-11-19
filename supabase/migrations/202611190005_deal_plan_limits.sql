-- Enforce Starter deal quota at the database boundary, including concurrent requests.
create or replace function public.enforce_starter_deal_limit()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_plan text; v_count integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,1));
 select coalesce((select plan from public.billing_profiles where user_id=new.user_id),'starter') into v_plan;
 if v_plan not in ('pro','agency') then
  select count(*) into v_count from public.deals where user_id=new.user_id;
  if v_count >= 3 then raise exception 'Upgrade required' using errcode='P0001'; end if;
 end if;
 return new;
end; $$;
drop trigger if exists enforce_starter_deal_limit on public.deals;
create trigger enforce_starter_deal_limit before insert on public.deals for each row execute function public.enforce_starter_deal_limit();
