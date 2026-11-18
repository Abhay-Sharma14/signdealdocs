-- Manual agency-owned UPI QR payment support.
alter table public.deals add column if not exists payment_method text not null default 'auto' check (payment_method in ('auto','manual_upi'));
alter table public.deals add column if not exists upi_qr_path text;
alter table public.deals add column if not exists payment_notified_at timestamptz;
alter table public.deals add column if not exists currency text not null default 'USD';
-- Extend the existing status check to allow confirmed manual payments.
alter table public.deals drop constraint if exists deals_status_check;
alter table public.deals add constraint deals_status_check check (status in ('draft','sent','signed','completed','paid'));
alter table public.audit_log drop constraint if exists audit_log_action_check;
alter table public.audit_log add constraint audit_log_action_check check (action in ('created','viewed','signed','uploaded','payment_notified','paid'));

-- Service-role API confirms manual payments; browser clients cannot set paid.
create or replace function public.protect_deal_client_update()
returns trigger language plpgsql as $func$
begin
 if auth.role() = 'service_role' then return new; end if;
 if auth.uid() is not null and auth.uid() = old.user_id then return new; end if;
 if new.user_id is distinct from old.user_id or new.slug is distinct from old.slug
    or new.client_name is distinct from old.client_name or new.client_email is distinct from old.client_email
    or new.project_title is distinct from old.project_title or new.currency is distinct from old.currency
    or new.amount is distinct from old.amount or new.proposal is distinct from old.proposal
    or new.required_documents is distinct from old.required_documents or new.created_at is distinct from old.created_at
    or new.id is distinct from old.id or new.payment_method is distinct from old.payment_method
    or new.upi_qr_path is distinct from old.upi_qr_path or new.paid_at is distinct from old.paid_at
    or new.payment_notified_at is distinct from old.payment_notified_at
 then raise exception 'Clients may only update signature and status'; end if;
 if old.status = 'sent' and new.status not in ('signed','completed') then raise exception 'Invalid status transition'; end if;
 if old.status = 'signed' and new.status not in ('signed','completed') then raise exception 'Invalid status transition'; end if;
 if old.status = 'completed' and new.status <> 'completed' then raise exception 'Invalid status transition'; end if;
 if old.status = 'draft' then raise exception 'Draft deals cannot be updated from client portal'; end if;
 return new;
end;
$func$;
