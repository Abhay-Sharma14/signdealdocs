"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {isIndiaVisitor} from "@/lib/visitor-region";

type Plan="starter"|"pro"|"agency";
type Currency="USD"|"INR"|"EUR"|"JPY"|"GBP"|"AUD"|"CAD";
const usdPrices:Record<Plan,number>={starter:0,pro:29,agency:49};
// Indicative display-only rates. Checkout remains USD; these are not live FX quotes.
const rates:Record<Currency,number>={USD:1,INR:1,EUR:0.92,JPY:150,GBP:0.79,AUD:1.52,CAD:1.36};
const indiaPrices:Record<Plan,number>={starter:0,pro:2499,agency:4199};

function visitorCurrency():Currency{
 if(isIndiaVisitor())return "INR";
 let zone="";try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch{}
 if(zone==="Europe/London")return "GBP";
 if(zone.startsWith("Australia/"))return "AUD";
 if(zone.startsWith("America/Toronto")||zone.startsWith("America/Vancouver")||zone.startsWith("America/Edmonton")||zone.startsWith("America/Winnipeg")||zone.startsWith("America/Halifax")||zone.startsWith("America/St_Johns"))return "CAD";
 const language=navigator.language.toUpperCase();
 if(language.endsWith("-GB"))return "GBP";
 if(language.endsWith("-AU"))return "AUD";
 if(language.endsWith("-CA"))return "CAD";
 return "USD";
}
function selectedCurrency(pathname:string|null):Currency{
 // Explicit language selection takes precedence over location.
 if(/^\/(fr|de)(?:\/|$)/.test(pathname||""))return "EUR";
 if(/^\/ja(?:\/|$)/.test(pathname||""))return "JPY";
 return visitorCurrency();
}
export function IndiaPricing({plan,monthlyLabel="/mo"}:{plan:Plan;monthlyLabel?:string}){
 const pathname=usePathname();
 const [currency,setCurrency]=useState<Currency>("USD");
 useEffect(()=>{setCurrency(selectedCurrency(pathname));},[pathname]);
 const usd=usdPrices[plan];
 const amount=currency==="INR"?indiaPrices[plan]:Math.round(usd*rates[currency]);
 const display=new Intl.NumberFormat(currency==="INR"?"en-IN":currency==="JPY"?"ja-JP":currency==="EUR"?"de-DE":"en-US",{style:"currency",currency,maximumFractionDigits:0}).format(amount);
 return <div><p className="mt-4 break-words text-4xl font-extrabold">{display}<span className="ml-1 text-sm font-medium text-slate-500">{monthlyLabel}</span></p>{currency!=="USD"&&plan!=="starter"&&<p className="mt-2 text-xs leading-5 text-slate-500">Estimated local price. Billed in USD via Dodo Payments (${usd} USD). Actual conversion and taxes may vary.</p>}</div>;
}
