"use client";
import {useEffect,useState} from "react";
import {CURRENCIES,CURRENCY_CODES,detectCurrency,formatEstimatedPrice,type CurrencyCode} from "@/lib/currency";
export function LocalCurrencyPricing({plan,monthlyLabel="/mo"}:{plan:"starter"|"pro"|"agency";monthlyLabel?:string}){
 const [currency,setCurrency]=useState<CurrencyCode>("USD");
 useEffect(()=>{let zone="";try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch{}setCurrency(detectCurrency(zone,navigator.language));},[]);
 const usd=plan==="starter"?0:plan==="pro"?29:49;
 return <div>
  <p className="mt-4 break-words text-4xl font-extrabold tracking-tight">{formatEstimatedPrice(usd,currency)}<span className="ml-1 text-sm font-medium text-slate-500">{monthlyLabel}</span></p>
  <label className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">Currency
   <select aria-label={`Display currency for ${plan} plan`} value={currency} onChange={e=>setCurrency(e.target.value as CurrencyCode)} className="max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">{CURRENCY_CODES.map(code=><option key={code} value={code}>{code} ({CURRENCIES[code].symbol})</option>)}</select>
  </label>
  {plan!=="starter"&&<p className="mt-3 text-xs leading-5 text-slate-500">Billed as ${usd} USD at checkout. Local currency is an estimate.</p>}
 </div>;
}
