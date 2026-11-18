import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
export type Plan="starter"|"pro"|"agency";
export function priceFor(plan:"pro"|"agency"){return plan==="pro"?process.env.STRIPE_PRO_PRICE_ID:process.env.STRIPE_AGENCY_PRICE_ID;}
export async function stripePost(path:string,form:URLSearchParams){
 const key=process.env.STRIPE_SECRET_KEY;if(!key)throw Error("Stripe secret key is not configured.");
 const response=await fetch(`https://api.stripe.com/v1/${path}`,{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/x-www-form-urlencoded"},body:form.toString(),cache:"no-store"});
 const data=await response.json();if(!response.ok)throw Error(data.error?.message||"Stripe request failed.");return data;
}
export function verifyStripeWebhook(body:string,header:string|null){
 const secret=process.env.STRIPE_WEBHOOK_SECRET;if(!secret||!header)return false;
 const parts=header.split(",");const timestamp=parts.find(x=>x.startsWith("t="))?.slice(2);const signatures=parts.filter(x=>x.startsWith("v1=")).map(x=>x.slice(3));
 if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>300)return false;
 const digest=createHmac("sha256",secret).update(`${timestamp}.${body}`).digest("hex");
 return signatures.some(signature=>{if(!/^[0-9a-f]{64}$/i.test(signature))return false;return timingSafeEqual(Buffer.from(signature,"hex"),Buffer.from(digest,"hex"));});
}
