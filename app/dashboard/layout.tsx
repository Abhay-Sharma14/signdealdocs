import type {ReactNode} from "react";
import {SiteFooter} from "@/components/site-footer";

export default function WorkspaceLayout({children}:{children:ReactNode}){
 return <div className="flex min-h-screen flex-col"><div className="flex-1">{children}</div><SiteFooter compact /></div>;
}
