import type {Metadata} from "next";
import type {ReactNode} from "react";
import {siteUrl} from "@/lib/site-url";

const canonical="/client-onboarding-software";
export const metadata:Metadata={
 title:"Client Onboarding Software for Agencies",
 description:"Client onboarding software for agencies: organize proposals, electronic signatures, document collection, and payment coordination in a branded Deal Room. Start free.",
 alternates:{canonical},
 openGraph:{type:"website",url:canonical,title:"Client Onboarding Software for Agencies | SignDealDocs",description:"Simplify agency onboarding with client Deal Rooms, e-signatures, document requests, and payment coordination."},
 twitter:{card:"summary_large_image",title:"Client Onboarding Software for Agencies | SignDealDocs",description:"Organize client agreements, signatures, onboarding documents and payment steps in one Deal Room."},
};
export default function Layout({children}:{children:ReactNode}){
 const data={"@context":"https://schema.org","@type":"WebPage",name:"Client Onboarding Software for Agencies",url:new URL(canonical,siteUrl()).toString(),description:metadata.description,about:{"@type":"SoftwareApplication",name:"SignDealDocs",applicationCategory:"BusinessApplication",url:siteUrl().origin}};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\\u003c")}}/>{children}</>;
}
