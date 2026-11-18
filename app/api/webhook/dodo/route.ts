import {Webhooks} from "@dodopayments/nextjs";
import {admin} from "@/lib/deal-room";
export const runtime="nodejs";
const supported=["subscription.active","subscription.cancelled","subscription.on_hold"];
const makeHandler=()=>Webhooks({
 webhookKey:process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
 onPayload:async(payload)=>{
  const event=payload as unknown as {type?:string;data?:Record<string,unknown>};
  if(!event.type||!supported.includes(event.type)||!event.data)return;
  const data=event.data;
  const subscription=typeof data.subscription_id==="string"?data.subscription_id:typeof data.id==="string"?data.id:null;
  if(!subscription)throw Error("Missing subscription ID");
  const meta=data.metadata as Record<string,unknown>|undefined;
  let userId=typeof meta?.user_id==="string"?meta.user_id:null;
  const {data:existing,error:lookupError}=await admin().from("billing_profiles").select("user_id,dodo_subscription_id").eq("dodo_subscription_id",subscription).maybeSingle();
  if(lookupError)throw lookupError;
  if(existing?.user_id&&userId&&existing.user_id!==userId)throw Error("Subscription owner mismatch");
  userId=existing?.user_id||userId;
  if(!userId)throw Error("No linked billing user");
  const configured=meta?.plan==="pro"?process.env.DODO_PRO_PRODUCT_ID:meta?.plan==="agency"?process.env.DODO_AGENCY_PRODUCT_ID:null;
  const productId=typeof data.product_id==="string"?data.product_id:null;
  if(event.type==="subscription.active"&&(!configured||productId&&productId!==configured))throw Error("Unknown subscription product");
  const plan=event.type==="subscription.cancelled"?"free":event.type==="subscription.on_hold"?"past_due":meta?.plan;
  if(plan!=="free"&&plan!=="past_due"&&plan!=="pro"&&plan!=="agency")throw Error("Unknown plan");
  const {error}=await admin().from("billing_profiles").upsert({user_id:userId,plan,dodo_subscription_id:subscription,dodo_customer_id:typeof data.customer_id==="string"?data.customer_id:null,subscription_status:event.type.split(".")[1],billing_provider:"dodo",updated_at:new Date().toISOString()},{onConflict:"user_id"});
  if(error)throw error;
 }
});
export async function POST(request:Request){
 if(!process.env.DODO_PAYMENTS_WEBHOOK_KEY)return Response.json({error:"Webhook not configured"},{status:503});
 return makeHandler()(request as never);
}
