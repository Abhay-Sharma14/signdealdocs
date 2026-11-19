import Link from "next/link";
import {Logo} from "@/components/logo";

type Props={tagline?:string;contactLabel?:string;copyright?:string;compact?:boolean};
export function SiteFooter({tagline="The white-labeled client portal for modern agencies.",contactLabel="Contact",copyright="© 2026 SignDealDocs. All rights reserved.",compact=false}:Props){
 return <footer className="border-t border-slate-200 bg-white">
  <div className={`mx-auto w-full px-4 pt-7 pb-20 sm:px-6 sm:pb-16 lg:px-8 ${compact?"max-w-5xl":"max-w-7xl"}`}>
   <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div><Logo/><p className="mt-1 text-xs text-slate-500">{tagline}</p></div>
    <a href="mailto:hello@signdealdocs.com" className="text-xs font-semibold text-slate-600 hover:text-indigo-700">{contactLabel}</a>
   </div>
   <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
    <span>{copyright}</span>
    <div className="flex flex-wrap gap-4 sm:pr-32"><Link href="/privacy" className="hover:text-indigo-700">Privacy Policy</Link><Link href="/terms" className="hover:text-indigo-700">Terms of Service</Link></div>
   </div>
  </div>
 </footer>;
}
