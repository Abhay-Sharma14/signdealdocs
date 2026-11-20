import Link from "next/link";
import {Logo} from "@/components/logo";

type Props={tagline?:string;contactLabel?:string;copyright?:string;compact?:boolean};
export function SiteFooter({tagline="The white-label client portal for modern agencies.",contactLabel="Contact",copyright="© 2026 SignDealDocs. All rights reserved.",compact=false}:Props){
 return <footer className={`border-t border-gray-200 bg-white ${compact?"shrink-0":""}`}>
  <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${compact?"max-w-5xl py-3":"max-w-7xl pt-8 pb-28 sm:pb-24"}`}>
   {!compact&&<div className="grid grid-cols-2 items-start gap-x-4 gap-y-6 pb-7 sm:gap-x-8">
    <div className="min-w-0">
     <div className="[&_svg]:!h-8 [&_svg]:!w-8 [&_span]:text-base sm:[&_span]:text-lg"><Logo/></div>
     <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">{tagline}</p>
    </div>
    <nav aria-label="Footer navigation" className="flex flex-col items-end gap-3 text-right text-xs font-medium text-slate-600 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-x-5 sm:gap-y-2 sm:text-sm">
     <a href="mailto:hello@signdealdocs.com" className="hover:text-indigo-700">{contactLabel}</a>
     <Link href="/privacy" className="hover:text-indigo-700">Privacy Policy</Link>
     <Link href="/terms" className="hover:text-indigo-700">Terms of Service</Link>
    </nav>
   </div>}
   <div className={`border-t border-gray-200 pt-4 text-xs text-slate-500 ${compact?"flex flex-wrap items-center justify-between gap-2":"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}`}>
    <span>{copyright}</span>
    <div className="flex flex-wrap gap-x-4 gap-y-2">
     {compact&&<a href="mailto:hello@signdealdocs.com" className="hover:text-indigo-700">{contactLabel}</a>}
     <Link href="/privacy" className="hover:text-indigo-700">Privacy Policy</Link>
     <Link href="/terms" className="hover:text-indigo-700">Terms of Service</Link>
    </div>
   </div>
  </div>
 </footer>;
}
