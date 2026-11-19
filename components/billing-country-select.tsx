"use client";
export type BillingCountry="US"|"IN";
export function BillingCountrySelect({value,onChange}:{value:BillingCountry;onChange:(value:BillingCountry)=>void}){
 return <label className="inline-flex items-center gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">Billing Country:<select aria-label="Billing Country" value={value} onChange={e=>onChange(e.target.value as BillingCountry)} className="rounded-lg bg-indigo-50 px-3 py-2 font-bold text-indigo-700 outline-none"><option value="US">United States</option><option value="IN">India</option></select></label>;
}
