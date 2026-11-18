import {admin,jsonError} from "@/lib/deal-room";
import {verifyStripeWebhook,priceFor} from "@/lib/stripe";
export const runtime="nodejs";
type StripeEvent={id:string;type:string;data:{object:Record<string,unknown>}};
const text=(value:unknown)=>typeof value==="string"?value:null;
async function apply(event:StripeEvent,userId:string,plan:"starter"|"pro"|"agency",customer:string|null,subscription:string|null,status:string){
 const {error}=await admin().rpc("apply_stripe_billing_event",{p_event_id:event.id,p_user_id:userId,p_plan:plan,p_customer_id:customer,p_subscription_id:subscription,p_status:status});
 if(error)throw Error("Billing database update failed.");
}
export async function POST(request:Request){
 const raw=await request.text();
 if(!verifyStripeWebhook(raw,request.headers.get("stripe-signature")))return jsonError("Invalid Stripe signature.",400);
 let event:StripeEvent;try{event=JSON.parse(raw);}catch{return jsonError("Invalid event.",400);}
 const object=event.data?.object;if(!event.id||!object)return jsonError("Invalid event.",400);
 try{
  if(event.type==="checkout.session.completed"){
   if(object.mode!=="subscription"||object.payment_status==="unpaid")return Response.json({received:true});
   const userId=text(object.client_reference_id);
   const metadata=object.metadata as Record<string,unknown>|undefined;
   const plan=metadata?.plan;
   if(!userId||(plan!=="pro"&&plan!=="agency"))return jsonError("Invalid subscription metadata.",400);
   await apply(event,userId,plan,text(object.customer),text(object.subscription),"active");
  }else if(["customer.subscription.updated","customer.subscription.deleted"].includes(event.type)){
   const customer=text(object.customer),subscription=text(object.id);
   const metadata=object.metadata as Record<string,unknown>|undefined;
   const userId=text(metadata?.user_id);
   if(!userId||!subscription)return jsonError("Missing subscription metadata.",400);
   const status=text(object.status)||"unknown";
   const items=object.items as {data?:Array<{price?:{id?:string}}>}|undefined;
   const priceId=items?.data?.[0]?.price?.id;
   const plan=status==="active"||status==="trialing"?(priceId===priceFor("agency")?"agency":priceId===priceFor("pro")?"pro":"starter"):"starter";
   await apply(event,userId,plan,customer,subscription,status);
  }
  return Response.json({received:true});
 }catch{return jsonError("Webhook processing failed; Stripe should retry.",500);}
}
