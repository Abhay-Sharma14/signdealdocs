"use client";
import {useEffect,useState} from "react";
import {isIndiaVisitor} from "@/lib/visitor-region";

export const supportedCurrencies=["USD","INR","EUR","GBP","JPY","AUD","CAD"] as const;
export type DealCurrency=typeof supportedCurrencies[number];
export function validCurrency(value:unknown):value is DealCurrency{
 return typeof value==="string"&&(supportedCurrencies as readonly string[]).includes(value);
}
export function detectCurrency():DealCurrency{
 if(typeof window==="undefined")return "USD";
 if(isIndiaVisitor())return "INR";
 let zone="";try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch{}
 if(zone==="Asia/Tokyo")return "JPY";
 if(zone==="Europe/London")return "GBP";
 if(zone.startsWith("Europe/"))return "EUR";
 if(zone.startsWith("Australia/"))return "AUD";
 if(zone.startsWith("America/Toronto")||zone.startsWith("America/Vancouver")||zone.startsWith("America/Edmonton")||zone.startsWith("America/Winnipeg")||zone.startsWith("America/Halifax")||zone.startsWith("America/St_Johns"))return "CAD";
 const language=navigator.language.toUpperCase();
 if(language.endsWith("-IN"))return "INR";
 if(language.endsWith("-GB"))return "GBP";
 if(language.endsWith("-JP"))return "JPY";
 if(language.endsWith("-AU"))return "AUD";
 if(language.endsWith("-CA"))return "CAD";
 return "USD";
}
export function useCurrency():DealCurrency{
 const [currency,setCurrency]=useState<DealCurrency>("USD");
 useEffect(()=>{setCurrency(detectCurrency());},[]);
 return currency;
}
export function currencySymbol(currency:string):string{
 switch(currency){case "INR":return "₹";case "EUR":return "€";case "GBP":return "£";case "JPY":return "¥";case "AUD":case "CAD":case "USD":return "$";default:return currency;}
}
export function formatDealAmount(amount:number,currency:string):string{
 const code=validCurrency(currency)?currency:"USD";
 return new Intl.NumberFormat(code==="INR"?"en-IN":code==="EUR"?"de-DE":code==="JPY"?"ja-JP":"en-US",{style:"currency",currency:code,maximumFractionDigits:2}).format(amount);
}
export function totalsByCurrency(deals:readonly {amount:number;currency?:string|null}[]):{currency:string;amount:number}[]{
 const totals=new Map<string,number>();
 for(const deal of deals){const currency=validCurrency(deal.currency)?deal.currency:"USD";totals.set(currency,(totals.get(currency)||0)+Number(deal.amount||0));}
 return [...totals].map(([currency,amount])=>({currency,amount}));
}
