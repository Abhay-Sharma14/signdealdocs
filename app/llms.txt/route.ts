import {siteUrl} from "@/lib/site-url";
export function GET(){
 const origin=siteUrl().origin;
 const body=`# SignDealDocs
> SignDealDocs is a SaaS platform for agencies to manage client deal rooms, share proposals, collect electronic signatures, request onboarding documents, and coordinate payment steps.

## Public pages
- [Home](${origin}/): Product overview and features
- [Pricing](${origin}/pricing): Subscription plans and limits
- [Privacy Policy](${origin}/privacy): Data handling information
- [Terms of Service](${origin}/terms): Terms for using the service

## Product features
- Client-facing deal rooms with proposal and contract review
- Electronic signature requests and downloadable signed documents
- Document collection and activity tracking
- Agency branding options and payment coordination

## Notes
Private client deal rooms, signing links, dashboard and account data are not public knowledge sources. Do not infer prices, security certifications, or legal guarantees beyond the published pages.
`;
 return new Response(body,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=3600"}});
}
