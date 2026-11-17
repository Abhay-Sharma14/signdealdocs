# Global document intake and identity-source integrations

## Available in this feature branch

The deal portal accepts common business document formats from a local device:

- PDF
- Microsoft Word, Excel and PowerPoint (legacy and Open XML)
- OpenDocument Text, Spreadsheet and Presentation
- RTF, TXT and CSV
- JPEG, PNG, WebP and HEIC/HEIF images

The portal file input supports mobile file selection and camera capture. Uploads are limited to 25 MiB, stored in the private Supabase Storage bucket, and served through short-lived signed URLs. The server validates extension, declared MIME compatibility, and file signatures for supported formats. Executables, HTML, SVG and archives are deliberately rejected.

## DigiLocker (India)

DigiLocker is not a public unauthenticated file endpoint. SignDealDocs must apply as a Requester/partner, complete eligibility and onboarding, register its domain and redirect URIs, obtain client credentials, and pass testing/audit before production access. The user must explicitly consent and choose the document. Do not ask for or collect a user's DigiLocker password or Aadhaar OTP.

Official partner entry point: https://partners.apisetu.gov.in/
Official partner information: https://www.digilocker.gov.in/web/partners/issuers
API Setu documentation: https://apisetu.gov.in/digilocker

Implementation should be a server-side OAuth/requester adapter:
1. Start authorization from the user's explicit "Import from DigiLocker" action.
2. Validate state/nonce and the registered redirect URI.
3. Exchange authorization code server-side; keep client secret in server environment only.
4. Request only the minimum document scope/URI the user selects.
5. Fetch the selected document server-side, validate it, store it in the private deal vault, and write a provenance record (provider, issuer, document URI/reference, consent timestamp, retrieval timestamp).
6. Never persist DigiLocker access tokens in browser storage; support consent revocation and deletion/retention policies.

No production DigiLocker OAuth flow is enabled until the official partner credentials and approval are provided.

## Other countries and cloud sources

There is no single worldwide equivalent of DigiLocker with one API. Integrate providers through independent adapters, based on country, customer eligibility and official partner access. Examples to evaluate:
- EU/EEA: EUDI Wallet ecosystem and qualified trust-service providers; eIDAS signature requirements vary by transaction.
- United Kingdom: GOV.UK One Login and document-checking providers, subject to approved service access.
- United States/Canada: identity-proofing and document-verification vendors, subject to contracts and regional rules.
- Cloud file sources: Google Drive Picker, Microsoft OneDrive File Picker and Dropbox Chooser; each requires its own OAuth app registration, scopes, verification and consent.

Google Picker official documentation: https://developers.google.com/workspace/drive/api/guides/picker

## Production security gates still required

- Malware scanning/quarantine before a document is made available to recipients.
- Rate limits, per-deal and per-account storage quotas, upload audit events.
- Encryption/key-management and backup/restore review.
- Data residency, retention, deletion, privacy notices and DPA review for target markets.
- File content parsing/preview in a sandbox; do not render untrusted HTML/SVG.
- Verified signature provider integration where legally required; a drawn signature image alone must not be marketed as a qualified electronic signature.

## Required deployment configuration

Apply `supabase/migrations/202611170001_expand_document_vault.sql` to the Supabase project before deploying this branch. The schema file is also updated for fresh installations.

DigiLocker and cloud provider secrets must be added only to server-side deployment environment variables after provider approval. Never add secrets to NEXT_PUBLIC variables or commit them to Git.
