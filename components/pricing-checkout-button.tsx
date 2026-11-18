"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
type Plan="starter"|"pro"|"agency";
export function PricingCheckoutButton({plan,className=""}:{plan:Plan;region?:"india"|"global";className?:string}){
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const router=useRouter();
 async function start(){
  if(plan==="starter"){router.push("/login");return;}
  setLoading(true);setError("");
  try{
   const {data,error:authError}=await supabase.auth.getSession();
   if(authError)throw Error("Could not verify session.");
   if(!data.session){router.push("/login?next="+encodeURIComponent("/pricing"));return;}
   const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({productId:plan})});
   const raw=await response.text();
   let result:Record<string,unknown>={};
   try{result=JSON.parse(raw) as Record<string,unknown>;}catch{
    if(!response.ok)throw Error(`Checkout failed (HTTP ${response.status}). ${raw.slice(0,180)||"Please check payment configuration."}`);
    throw Error("Payment provider returned an unexpected response.");
   }
   if(!response.ok)throw Error(String(result.error||result.message||`Checkout failed (HTTP ${response.status}).`));
   const url=result.checkout_url||result.url;
   if(typeof url!=="string"||!url.startsWith("https://"))throw Error("Invalid checkout URL.");
   window.location.assign(url);
  }catch(e){setError(e instanceof Error?e.message:"Could not open checkout.");setLoading(false);}
 }
 return <div className="w-full"><button type="button" onClick={()=>void start()} disabled={loading} className={`w-full rounded-xl bg-violet-600 px-5 py-3.5 text-center text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60 ${className}`}>{loading?"Opening secure checkout…":plan==="starter"?"Start for free":plan==="pro"?"Start 14-day Free Trial":"Get Agency Plan"}</button>{error&&<p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}</div>;
}
