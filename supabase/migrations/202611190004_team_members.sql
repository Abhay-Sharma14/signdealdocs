-- Team invitations are owner-scoped. billing_profiles.plan is the Dodo-managed plan source.
create table if not exists public.team_members (
 id uuid primary key default gen_random_uuid(),
 agency_id uuid not null references auth.users(id) on delete cascade,
 member_email text not null,
 role text not null default 'member' check (role in ('admin','member')),
 created_at timestamptz not null default now(),
 unique(agency_id,member_email),
 constraint team_member_email_valid check (member_email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')
);
create index if not exists team_members_agency_idx on public.team_members(agency_id);
alter table public.team_members enable row level security;
drop policy if exists "team owner read" on public.team_members;
create policy "team owner read" on public.team_members for select to authenticated using (agency_id=auth.uid());
-- Mutations go through authenticated server APIs; no client-side INSERT/UPDATE policies.
create or replace function public.invite_team_member(p_owner uuid,p_email text,p_role text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_plan text; v_count integer; v_id uuid; v_limit integer;
begin
 if auth.role() <> 'service_role' then raise exception 'Unauthorized' using errcode='42501'; end if;
 select coalesce((select plan from public.billing_profiles where user_id=p_owner),'starter') into v_plan;
 if v_plan not in ('pro','agency') then raise exception 'Upgrade required' using errcode='P0001'; end if;
 if p_role not in ('admin','member') then raise exception 'Invalid role' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,0));
 select count(*) into v_count from public.team_members where agency_id=p_owner;
 v_limit:=case when v_plan='pro' then 3 else 10 end;
 if v_count+1 >= v_limit then raise exception 'Upgrade required' using errcode='P0001'; end if;
 insert into public.team_members(agency_id,member_email,role)
 values(p_owner,lower(trim(p_email)),p_role) returning id into v_id;
 return v_id;
end; $$;
revoke all on function public.invite_team_member(uuid,text,text) from public,anon,authenticated;
grant execute on function public.invite_team_member(uuid,text,text) to service_role;
