"use client";
import {useLocale} from "next-intl";
import {useRouter} from "next/navigation";
const labels={en:"English",fr:"Français",de:"Deutsch",ja:"日本語"} as const;
export function LandingLanguageSwitcher(){
 const locale=useLocale();const router=useRouter();
 return <label className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><span aria-hidden="true">🌐</span><span className="sr-only">Language</span><select aria-label="Language" value={locale} onChange={e=>router.push(e.target.value==="en"?"/":`/${e.target.value}`)} className="max-w-28 bg-transparent text-sm outline-none">{Object.entries(labels).map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label>;
}
