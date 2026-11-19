"use client";
import {useEffect,useState} from "react";
import {isIndiaVisitor} from "@/lib/visitor-region";
export function IndiaPricing({plan,monthlyLabel="/mo"}:{plan:"starter"|"pro"|"agency";monthlyLabel?:string}){
 const [india,setIndia]=useState(false);
 useEffect(()=>{setIndia(isIndiaVisitor());},[]);
 const usd=plan==="starter"?0:plan==="pro"?29:49;
 const inr=plan==="starter"?0:plan==="pro"?2499:4199;
 const display=india?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(inr):new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(usd);
 return <div><p className="mt-4 break-words text-4xl font-extrabold">{display}<span className="ml-1 text-sm font-medium text-slate-500">{monthlyLabel}</span></p>{india&&plan!=="starter"&&<p className="mt-2 text-xs leading-5 text-slate-500">Billed in USD via Dodo Payments (${usd} USD; approx. {display}). Your bank determines the actual INR charge.</p>}</div>;
}
