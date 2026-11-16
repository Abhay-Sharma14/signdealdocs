# Security hardening deployment notes

This branch changes public deal-room access from direct anonymous Supabase table/storage access to server-mediated access.

## Required deployment configuration

Keep these variables in the hosting provider's server-side environment only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never prefix with `NEXT_PUBLIC_`)
- `GEMINI_API_KEY`

Redeploy after setting the service-role key. Do not commit environment files or keys.

## Apply the database migration

Review and apply `supabase/migrations/202611160001_security_hardening.sql` in the Supabase SQL editor (or through your configured migration workflow). It removes anonymous policies on deals/documents, makes `deal-vault` private, and removes direct browser storage policies.

The application server uses the service-role client only in server route handlers. Never import `lib/supabase-admin.ts` from a Client Component.

## Demo data and magic links

New deal links use a cryptographically secure 256-bit random token. Existing demo links created before this change use the old short slug format and will stop resolving after this release. Create fresh demo deals and resend their links.

The portal API returns short-lived (5-minute) signed storage URLs. Treat each magic link as a bearer secret: anyone holding it can access that deal's client-facing proposal and perform the allowed portal actions.

## Important product/legal boundary

The drawn PNG signature is an electronic acceptance artifact, not a certificate-backed or qualified electronic signature. Do not market this flow as legally equivalent to Aadhaar eSign, DSC, QES, or a regulated trust-service signature. Integrate an appropriate licensed signing provider for those requirements.

## Verification before production

- Set the server-only service-role secret and apply the migration.
- Create a fresh deal and verify its link can load the deal room.
- Verify an unauthenticated browser cannot select from `deals` or `deal_documents`, or read/upload objects in `deal-vault` directly.
- Verify signing works once only, document uploads are limited to requested labels, and files are served using short-lived signed URLs.
- Verify one owner cannot access another owner's documents via `/api/owner/deals/:id/documents`.
- Run `npm ci`, `npm run lint`, and `npm run build` in CI before merging.
