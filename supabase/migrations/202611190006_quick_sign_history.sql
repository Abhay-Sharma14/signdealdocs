-- Standalone signatures are distinct from Deal Rooms; completed PDF remains in private Storage.
alter table public.signature_requests add column if not exists type text not null default 'quick_sign';
alter table public.signature_requests drop constraint if exists signature_requests_type_check;
alter table public.signature_requests add constraint signature_requests_type_check check (type='quick_sign');
alter table public.signature_requests add column if not exists completed_pdf_path text;
create index if not exists signature_requests_owner_type_idx on public.signature_requests(owner_id,type,created_at desc);
