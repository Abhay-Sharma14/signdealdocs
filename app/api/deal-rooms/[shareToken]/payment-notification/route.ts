import {admin,publicDeal,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
type C={params:Promise<{shareToken:string}>};
export async function POST(request:Request,{params}:C){
 const {shareToken}=await params;
 const deal=await publicDeal(shareToken);
 if(!deal)return jsonError("Deal unavailable.",404);
 if(!["manual_upi","payment_link"].includes(deal.payment_method))return jsonError("This deal does not support payment reporting.",400);
 if(deal.paid_at||deal.status==="paid")return jsonError("Payment already confirmed.",409);
 const {data:contract}=await admin().from("deal_items").select("status").eq("deal_id",deal.id).eq("type","contract").maybeSingle();
 if(contract?.status!=="signed")return jsonError("Sign the contract before notifying payment.",409);
 if(deal.payment_notified_at)return Response.json({ok:true,already_notified:true});
 let body:unknown;try{body=await request.json();}catch{return jsonError("Invalid payment report.",400);}
 const reference=typeof (body as {reference?:unknown})?.reference==="string"?(body as {reference:string}).reference.trim():"";
 if(reference.length>120||reference&&!/^[a-zA-Z0-9 ._/#-]+$/.test(reference))return jsonError("Enter a valid transaction reference (up to 120 characters).",400);
 const now=new Date().toISOString();
 const {data:updated,error}=await admin().from("deals").update({payment_notified_at:now,payment_reference:reference||null,payment_reported_method:deal.payment_method}).eq("id",deal.id).is("payment_notified_at",null).select("id").maybeSingle();
 if(error)return jsonError("Could not record notification.",500);
 if(!updated)return Response.json({ok:true,already_notified:true});
 const {error:auditError}=await admin().from("audit_log").insert({deal_id:deal.id,action:"payment_notified",actor_email:deal.client_email});
 if(auditError)console.error("UPI notification audit failed",auditError);
 const {data:agency,error:agencyError}=await admin().auth.admin.getUserById(deal.user_id);
 const to=agency?.user?.email;
 const key=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL;
 let emailSent=false;
 const amount=new Intl.NumberFormat("en-IN",{style:"currency",currency:deal.currency||"USD",maximumFractionDigits:2}).format(Number(deal.amount||0)*0.5);
 if(!agencyError&&to&&key&&from){
  try{
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject:"Client reported a payment for a Deal Room",text:`Client ${deal.client_name} reports a payment of ${amount} via ${deal.payment_method==="manual_upi"?"UPI":"the agency payment link"}. Reference: ${reference||"Not provided"}. Please verify and mark as paid.\nProject: ${deal.project_title}\nDeal ID: ${deal.id}\nDo not mark as paid until the funds appear in your bank/UPI account.`})});
   if(!response.ok)console.error("Agency payment notification email failed",response.status,(await response.text()).slice(0,250));else emailSent=true;
  }catch(e){console.error("UPI agency notification email error",e);}
 }else console.error("UPI agency notification email not configured or agency email unavailable");
 return Response.json({ok:true,recorded:true,emailSent});
}
