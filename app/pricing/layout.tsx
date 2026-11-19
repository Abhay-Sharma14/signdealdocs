import type {Metadata} from "next";
import type {ReactNode} from "react";
export const metadata:Metadata={
 title:"Pricing & Plans",
 description:"Explore SignDealDocs Starter, Pro, and Agency plans for client deal rooms and electronic signatures.",
 alternates:{canonical:"/pricing"},
};
export default function PublicPageLayout({children}:{children:ReactNode}){return children;}
