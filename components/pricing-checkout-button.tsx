"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
type PaddleInstance={Environment:{set:(env:string)=>void};Initialize:(options:{token:string})=>void;Checkout:{open:(options:{items:Array<{priceId:string;quantity:number}>;customData:Record<string,unknown>;settings:{displayMode:string;variant:string}})=>void}};
declare global {interface Window {Paddle?:PaddleInstance;__paddleInitialized?:boolean;}}
let scriptPromise:Promise<void>|null=null;
function loadPaddle(){
 if(window.Paddle)return Promise.resolve();
 if(!scriptPromise)scriptPromise=new Promise<void>((resolve,reject)=>{
  const script=document.createElement("script");script.src="https://cdn.paddle.com/paddle/v2/paddle.js";script.async=true;script.onload=()=>resolve();script.onerror=()=>reject(Error("Could not load Paddle.js"));document.head.appendChild(script);
 });
 return scriptPromise;
}
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
   await loadPaddle();
   const paddle=window.Paddle;if(!paddle)throw Error("Paddle.js unavailable.");
   if(!window.__paddleInitialized){if(process.env.NEXT_PUBLIC_PADDLE_ENV!=="production")paddle.Environment.set("sandbox");paddle.Initialize({token});window.__paddleInitialized=true;}
   paddle.Checkout.open({items:[{priceId:result.priceId,quantity:1}],customData:result.customData,settings:{displayMode:"overlay",variant:"one-page"}});
  }catch(e){setError(e instanceof Error?e.message:"Checkout failed.");}finally{setLoading(false);}
 }
 return <div className="w-full"><button type="button" onClick={()=>void start()} disabled={loading} className={`w-full rounded-xl bg-violet-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60 ${className}`}>{loading?"Opening checkout…":plan==="starter"?"Start for free":plan==="pro"?"Start 14-day Free Trial":"Get Agency Plan"}</button>{error&&<p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}</div>;
}
