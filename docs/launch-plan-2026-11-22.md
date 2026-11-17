# SignDealDocs launch plan — 22 November 2026 target

Status: **NOT launched**. This is a launch checklist, not a certification.

## Positioning
One secure link to share a proposal, collect an electronic signature and request onboarding documents. Focus first on freelancers, small agencies and service providers. Do not advertise certified/qualified e-signatures or live DigiLocker/automated WhatsApp/payment integrations until verified.

## Non-negotiable release gates
- [ ] Run security hardening and expanded document-vault migrations against the intended Supabase project; verify RLS and private bucket.
- [ ] Verify Vercel production environment variables and rotate previously exposed Gemini credentials.
- [ ] Test signup, login, logout, account isolation, deal creation, link sharing, signature, document upload/download, expiration/revocation and invalid-token behavior.
- [ ] Test mobile Android/iOS camera and document picker; PDF, DOCX, XLSX, PNG, JPEG, HEIC; oversized, malformed and executable uploads.
- [ ] Add malware scanning/quarantine or restrict public beta uploads to formats that can be safely handled with compensating controls.
- [ ] Confirm file signature and MIME validation; inspect Office ZIP containers rather than trusting only PK header.
- [ ] Verify quota and rate limits for public endpoints and document uploads; avoid exposing private signed document URLs to unrelated parties.
- [ ] Publish privacy policy, terms, acceptable use, data retention and support contact (with real reachable address).
- [ ] Verify signing consent language, audit event history, timestamp and limitations; do not promise legal certification.
- [ ] Configure uptime/error monitoring, backups, basic incident response and rollback.
- [ ] Verify CI lint/build plus actual end-to-end staging tests; obtain owner approval before merging to main or switching production traffic.

## Scope for launch
Included only after passing gates: proposals, basic signatures, private document vault, manual email/WhatsApp sharing, mobile upload, English-first responsive experience.
Later: DigiLocker and EUDI integrations (approval-dependent), automatic email/WhatsApp delivery, subscription billing, customer payment collection, amendments and refunds, full UI translations.

## Customer acquisition — first 50 users
Ideal early customers: freelance designers/developers, small marketing agencies, consultants and service businesses that send proposals and collect client paperwork.
- Build a list of 100 relevant prospects using public business contact channels; do not scrape private emails or send spam.
- Contact 10–15 prospects daily with personalized permission-based messages.
- Offer 15-minute walkthroughs and a small free beta quota; collect feedback.
- Track: approached, replies, demos, signups, activated (first deal sent), first paid conversion.
- Aim for 10 interviews, 5 active beta testers and 1–3 paying pilots before scaling acquisition.
- Do not claim 50 customers already exist or that features are live if not verified.

## Proposed commercial model (not live)
Free limited plan; Starter India ₹299/month, international $4.99/month; Professional ₹799/$12.99; Business ₹1499/$24.99. Pricing and quotas must be cost-tested, localized and disclosed before checkout. No payment gateway is integrated yet.

## Daily launch cadence
Nov 17–18: review security, migrations and upload risk; staging tests.
Nov 19: fix blockers, legal/support pages and monitoring.
Nov 20: controlled beta with test accounts; feedback and bug fixes.
Nov 21: release go/no-go against checklist; do not bypass blockers.
Nov 22: launch only if all mandatory gates pass; otherwise run invitation-only demo and announce a revised date.
