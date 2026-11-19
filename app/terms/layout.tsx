import type {Metadata} from "next";
import type {ReactNode} from "react";
export const metadata:Metadata={
 title:"Terms of Service",
 description:"Read the terms and responsibilities for using SignDealDocs.",
 alternates:{canonical:"/terms"},
};
export default function PublicPageLayout({children}:{children:ReactNode}){return children;}
