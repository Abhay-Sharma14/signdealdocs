-- Optional signature placement in PDF points (origin at bottom-left).
alter table public.signature_requests
 add column if not exists signature_page integer,
 add column if not exists signature_x double precision,
 add column if not exists signature_y double precision,
 add column if not exists signature_width double precision,
 add column if not exists signature_height double precision;
