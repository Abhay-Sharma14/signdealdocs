-- Short agency deal room links. Keep existing long links working.
-- Existing deals.slug remains UNIQUE; new links use six random base62 characters.
-- IMPORTANT: 6-character public links have ~36 bits of entropy and are NOT
-- equivalent to the previous 256-bit signing tokens. Add edge rate limiting,
-- link expiry, and optional client verification before production rollout.
create index if not exists deals_slug_lookup_idx on public.deals(slug);
