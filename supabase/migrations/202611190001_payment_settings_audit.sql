-- Extend audit events to record agency changes to payment method and QR.
alter table public.audit_log drop constraint if exists audit_log_action_check;
alter table public.audit_log add constraint audit_log_action_check
 check (action in ('created','viewed','signed','uploaded','payment_notified','paid','payment_settings_updated'));
