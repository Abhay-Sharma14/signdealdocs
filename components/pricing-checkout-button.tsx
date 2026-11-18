"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
type Plan="starter"|"pro"|"agency";
export function PricingCheckoutButton({plan,className=""}:{plan:Plan;className?:string}){
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const router=useRouter();
 async function start(){
  if(plan==="starter"){router.push("/login");return;}
  setLoading(true);setError("");
  try{
   const {data,error:authError}=await supabase.auth.getSession();
   if(authError)throw Error("Unable to check your session.");
   if(!data.session){router.push("/login?next="+encodeURIComponent("/pricing?plan="+plan));return;}
   const response=await fetch("/api/stripe/checkout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({plan})});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||"Could not start checkout.");
   if(typeof result.url!=="string"||!result.url.startsWith("https://checkout.stripe.com/"))throw Error("Invalid checkout URL.");
   window.location.assign(result.url);
  }catch(e){setError(e instanceof Error?e.message:"Checkout failed.");setLoading(false);}
 }
 return <div className="w-full"><button type="button" onClick={()=>void start()} disabled={loading} className={`w-full rounded-xl bg-violet-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-60 ${className}`}>{loading?"Opening secure checkout…":plan==="starter"?"Start for free":plan==="pro"?"Start 14-day Free Trial":"Get Agency Plan"}</button>{error&&<p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}</div>;
}
