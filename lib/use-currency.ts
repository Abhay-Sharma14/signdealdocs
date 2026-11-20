"use client";
import {useSyncExternalStore} from "react";
import {isIndiaVisitor} from "@/lib/visitor-region";
import type {DealCurrency} from "@/lib/deal-currency";

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
function subscribeCurrency(){return ()=>{};}
function serverCurrency():DealCurrency{return "USD";}
export function useCurrency():DealCurrency{
 return useSyncExternalStore(subscribeCurrency,detectCurrency,serverCurrency);
}
