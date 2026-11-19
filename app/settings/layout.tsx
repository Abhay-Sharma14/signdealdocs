import type {ReactNode} from "react";
import {SiteFooter} from "@/components/site-footer";

export default function WorkspaceLayout({children}:{children:ReactNode}){
 return <div className="flex min-h-screen flex-col"><div className="flex flex-1 flex-col">{children}</div><SiteFooter compact /></div>;
}
