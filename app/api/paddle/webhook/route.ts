import {admin,jsonError} from "@/lib/deal-room";
import {paddlePrice,validProof,verifyPaddle} from "@/lib/paddle";
export const runtime="nodejs";
type PaddleEvent={event_id?:string;event_type?:string;occurred_at?:string;data?:Record<string,unknown>};
const str=(v:unknown)=>typeof v==="string"?v:null;
export async function POST(request:Request){
 const raw=await request.text();
 if(!verifyPaddle(raw,request.headers.get("paddle-signature")))return jsonError("Invalid signature.",401);
 let event:PaddleEvent;try{event=JSON.parse(raw);}catch{return jsonError("Invalid payload.",400);}
 if(!event.event_id||!event.data)return jsonError("Invalid event.",400);
 if(!["subscription.created","subscription.updated","subscription.canceled"].includes(event.event_type||""))return Response.json({received:true});
 const data=event.data;
 const subscription=str(data.id),customer=str(data.customer_id),status=event.event_type==="subscription.canceled"?"canceled":str(data.status)||"unknown";
 if(!subscription)return jsonError("Missing subscription ID.",400);
 const meta=data.custom_data as Record<string,unknown>|null;
 let userId=str(meta?.user_id);
 if(userId&&(!meta||!validProof(userId,str(meta.plan)||"",meta.expiry,meta.proof)))userId=null;
 if(!userId){
  const {data:existing,error}=await admin().from("billing_profiles").select("user_id").eq("paddle_subscription_id",subscription).maybeSingle();
  if(error)return jsonError("Billing lookup failed.",500);
  userId=existing?.user_id||null;
 }
 if(!userId)return jsonError("Subscription not linked to an account.",400);
 const items=data.items as Array<{price?:{id?:string}}>|undefined;
 const priceId=items?.[0]?.price?.id;
 const plan=status==="active"||status==="trialing"?(priceId===paddlePrice("agency")?"agency":priceId===paddlePrice("pro")?"pro":"starter"):"starter";
 const {error}=await admin().rpc("apply_paddle_billing_event",{p_event_id:event.event_id,p_user_id:userId,p_plan:plan,p_customer_id:customer,p_subscription_id:subscription,p_status:status,p_occurred_at:event.occurred_at||new Date().toISOString()});
 if(error)return jsonError("Could not update subscription.",500);
 return Response.json({received:true});
}
