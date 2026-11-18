"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {initializePaddle} from "@paddle/paddle-js";
type Plan="starter"|"pro"|"agency";
export function PricingCheckoutButton({plan,region="global",className=""}:{plan:Plan;region?:"india"|"global";className?:string}){
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const router=useRouter();
 async function start(){
  if(plan==="starter"){router.push("/login");return;}
  setLoading(true);setError("");
  try{
   const {data,error:authError}=await supabase.auth.getSession();
   if(authError)throw Error("Unable to check your session.");
   if(!data.session){router.push("/login?next="+encodeURIComponent("/pricing?plan="+plan));return;}
   if(region==="india"){
    const response=await fetch("/api/razorpay/checkout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({plan})});
    const result=await response.json();if(!response.ok)throw Error(result.error||"Razorpay unavailable.");
    if(!result.url)throw Error("Razorpay checkout URL missing.");
    window.location.assign(result.url);return;
   }
   const token=process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
   if(!token)throw Error("Paddle client token is not configured.");
   const response=await fetch("/api/paddle/checkout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({plan})});
   const result=await response.json();if(!response.ok)throw Error(result.error||"Paddle unavailable.");
   const paddle=await initializePaddle({token,environment:process.env.NEXT_PUBLIC_PADDLE_ENV==="production"?"production":"sandbox"});
   if(!paddle)throw Error("Could not initialize Paddle.");
   paddle.Checkout.open({items:[{priceId:result.priceId,quantity:1}],customData:result.customData,settings:{displayMode:"overlay",variant:"one-page"}});
  }catch(e){setError(e instanceof Error?e.message:"Checkout failed.");}finally{setLoading(false);}
 }
 return <div className="w-full"><button type="button" onClick={()=>void start()} disabled={loading} className={`w-full rounded-xl bg-violet-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60 ${className}`}>{loading?"Opening checkout…":plan==="starter"?"Start for free":plan==="pro"?"Start 14-day Free Trial":"Get Agency Plan"}</button>{error&&<p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}</div>;
}
