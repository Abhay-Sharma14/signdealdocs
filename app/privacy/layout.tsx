import type {Metadata} from "next";
import type {ReactNode} from "react";
export const metadata:Metadata={
 title:"Privacy Policy",
 description:"Learn how SignDealDocs handles account, signing, and client document information.",
 alternates:{canonical:"/privacy"},
};
export default function PublicPageLayout({children}:{children:ReactNode}){return children;}
