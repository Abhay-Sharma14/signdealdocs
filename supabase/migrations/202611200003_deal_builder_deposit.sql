alter table public.deals add column if not exists deposit_percent numeric(5,2) not null default 50;
alter table public.deals add constraint deals_deposit_percent_range check (deposit_percent > 0 and deposit_percent <= 100);
