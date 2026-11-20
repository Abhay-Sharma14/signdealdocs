import {admin,owner,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
type DodoSubscription={subscription_id?:string;status?:string;next_billing_date?:string|null;cancel_at_next_billing_date?:boolean;product_id?:string};
const providerBase=()=>process.env.DODO_PAYMENTS_ENVIRONMENT==="live_mode"?"https://live.dodopayments.com":"https://test.dodopayments.com";
async function providerSubscription(id:string,method:"GET"|"PATCH"="GET"){
 const key=process.env.DODO_PAYMENTS_API_KEY;
 if(!key||!["live_mode","test_mode"].includes(process.env.DODO_PAYMENTS_ENVIRONMENT||""))throw Error("Dodo provider is not configured");
 const response=await fetch(`${providerBase()}/subscriptions/${encodeURIComponent(id)}`,{
  method,headers:{Authorization:`Bearer ${key}`,...(method==="PATCH"?{"Content-Type":"application/json"}:{})},
  ...(method==="PATCH"?{body:JSON.stringify({cancel_at_next_billing_date:true})}:{}),
  cache:"no-store",signal:AbortSignal.timeout(15000)
 });
 if(!response.ok){console.error("Dodo subscription request failed",method,response.status);throw Error("Dodo subscription request failed");}
 const result=await response.json() as DodoSubscription;
 if(!result||typeof result!=="object")throw Error("Invalid provider subscription response");
 return result;
}
export async function GET(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 const {data,error}=await admin().from("billing_profiles").select("plan,subscription_status,dodo_subscription_id,cancel_at_period_end,current_period_end").eq("user_id",user.id).maybeSingle();
 if(error)return jsonError("Billing database unavailable. Apply migration.",503);
 let status=data?.subscription_status||null,plan=data?.plan||"starter";
 let cancelAtPeriodEnd=data?.cancel_at_period_end===true,periodEnd=data?.current_period_end||null;
 if(data?.dodo_subscription_id){
  try{
   const subscription=await providerSubscription(data.dodo_subscription_id);
   if(typeof subscription.status==="string")status=subscription.status;
   cancelAtPeriodEnd=subscription.cancel_at_next_billing_date===true;
   periodEnd=subscription.next_billing_date||periodEnd;
   if(status==="cancelled"||status==="expired"||status==="failed"){
    plan="starter";
   }
   const {error:updateError}=await admin().from("billing_profiles").update({
    plan,subscription_status:status,cancel_at_period_end:cancelAtPeriodEnd,current_period_end:periodEnd,updated_at:new Date().toISOString()
   }).eq("user_id",user.id).eq("dodo_subscription_id",data.dodo_subscription_id);
   if(updateError)console.error("Billing sync failed",updateError.message);
  }catch{ return jsonError("Unable to verify subscription status with payment provider. Please retry.",502); }
 }
 return Response.json({plan,status,cancelAtPeriodEnd,periodEnd,hasSubscription:Boolean(data?.dodo_subscription_id)},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 let body:unknown;try{body=await request.json();}catch{return jsonError("Invalid JSON.",400);}
 if(!body||typeof body!=="object"||(body as Record<string,unknown>).action!=="cancel")return jsonError("Invalid billing action.",400);
 const {data,error}=await admin().from("billing_profiles").select("plan,dodo_subscription_id").eq("user_id",user.id).maybeSingle();
 if(error)return jsonError("Billing database unavailable.",503);
 if(!data?.dodo_subscription_id||!["pro","agency"].includes(data.plan))return jsonError("No active paid subscription found.",409);
 try{
  const before=await providerSubscription(data.dodo_subscription_id);
  if(before.status!=="active")return jsonError("Only active subscriptions can be scheduled for cancellation.",409);
  if(before.cancel_at_next_billing_date===true)return Response.json({ok:true,cancelAtPeriodEnd:true,periodEnd:before.next_billing_date||null});
  await providerSubscription(data.dodo_subscription_id,"PATCH");
  const after=await providerSubscription(data.dodo_subscription_id);
  if(after.cancel_at_next_billing_date!==true)return jsonError("Cancellation could not be verified. Please contact support.",502);
  const {error:saveError}=await admin().from("billing_profiles").update({
   cancel_at_period_end:true,current_period_end:after.next_billing_date||null,updated_at:new Date().toISOString()
  }).eq("user_id",user.id).eq("dodo_subscription_id",data.dodo_subscription_id);
  if(saveError){console.error("Cancellation recorded at Dodo but local sync failed",saveError.message);return jsonError("Cancellation was scheduled with the payment provider, but local status could not be updated. Please refresh.",502);}
  return Response.json({ok:true,cancelAtPeriodEnd:true,periodEnd:after.next_billing_date||null},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("Subscription cancellation failed",e);return jsonError("Could not schedule cancellation. Please retry or contact support.",502);}
}
