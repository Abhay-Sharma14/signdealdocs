import type {ReactNode} from "react";
import {SiteFooter} from "@/components/site-footer";
import {WorkspaceProfileHeader} from "@/components/workspace-profile-header";

export default function WorkspaceLayout({children}:{children:ReactNode}){
 return <div className="flex h-dvh min-h-0 flex-col overflow-hidden"><WorkspaceProfileHeader/><div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">{children}</div><SiteFooter compact /></div>;
}
