import {owner,jsonError,admin} from "@/lib/deal-room";
import {priceFor,stripePost} from "@/lib/stripe";
export const runtime="nodejs";
export async function POST(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 let input:unknown;try{input=await request.json();}catch{return jsonError("Invalid request.",400);}
 const plan=(input as {plan?:unknown})?.plan;
 if(plan!=="pro"&&plan!=="agency")return jsonError("Choose Pro or Agency.",400);
 const price=priceFor(plan);if(!price)return jsonError("Stripe price is not configured.",503);
 const origin=process.env.NEXT_PUBLIC_SITE_URL||"https://www.signdealdocs.com";
 try{
  const {data:billing}=await admin().from("billing_profiles").select("stripe_customer_id").eq("user_id",user.id).maybeSingle();
  const form=new URLSearchParams({mode:"subscription",success_url:`${origin}/settings?checkout=success`,cancel_url:`${origin}/pricing?checkout=cancelled`,"line_items[0][price]":price,"line_items[0][quantity]":"1",client_reference_id:user.id,"metadata[user_id]":user.id,"metadata[plan]":plan,"subscription_data[metadata][user_id]":user.id,"subscription_data[metadata][plan]":plan});
  if(billing?.stripe_customer_id)form.set("customer",billing.stripe_customer_id);
  else if(user.email)form.set("customer_email",user.email);
  const session=await stripePost("checkout/sessions",form);
  if(typeof session.url!=="string"||!session.url.startsWith("https://checkout.stripe.com/"))return jsonError("Stripe did not return a checkout URL.",502);
  return Response.json({url:session.url},{headers:{"Cache-Control":"no-store"}});
 }catch{return jsonError("Could not start checkout. Check Stripe configuration.",503);}
}
