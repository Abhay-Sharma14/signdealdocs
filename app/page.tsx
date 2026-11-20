import {siteUrl} from "@/lib/site-url";
import {NextIntlClientProvider} from "next-intl";
import ExecutiveLanding from "@/components/executive-landing";
import en from "@/messages/en.json";
export default function Page(){const origin=siteUrl().origin;const schema={"@context":"https://schema.org","@type":"SoftwareApplication",name:"SignDealDocs",url:origin,applicationCategory:"BusinessApplication",operatingSystem:"Web",description:"Client deal rooms for proposals, electronic signatures, onboarding documents and payment coordination.",offers:{"@type":"Offer",price:"0",priceCurrency:"USD",description:"Starter plan with 3 deal rooms"}};return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/><NextIntlClientProvider locale="en" messages={en}><ExecutiveLanding/></NextIntlClientProvider></>;}
