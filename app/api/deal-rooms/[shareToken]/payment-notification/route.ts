import {admin,publicDeal,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
type C={params:Promise<{shareToken:string}>};
export async function POST(_request:Request,{params}:C){
 const {shareToken}=await params;
 const deal=await publicDeal(shareToken);
 if(!deal)return jsonError("Deal unavailable.",404);
 if(deal.payment_method!=="manual_upi")return jsonError("Not a manual UPI deal.",400);
 if(deal.paid_at||deal.status==="paid")return jsonError("Payment already confirmed.",409);
 const {data:contract}=await admin().from("deal_items").select("status").eq("deal_id",deal.id).eq("type","contract").maybeSingle();
 if(contract?.status!=="signed")return jsonError("Sign the contract before notifying payment.",409);
 if(deal.payment_notified_at)return Response.json({ok:true,already_notified:true});
 const now=new Date().toISOString();
 const {data:updated,error}=await admin().from("deals").update({payment_notified_at:now}).eq("id",deal.id).is("payment_notified_at",null).select("id").maybeSingle();
 if(error)return jsonError("Could not record notification.",500);
 if(!updated)return Response.json({ok:true,already_notified:true});
 const {error:auditError}=await admin().from("audit_log").insert({deal_id:deal.id,action:"payment_notified",actor_email:deal.client_email});
 if(auditError)console.error("UPI notification audit failed",auditError);
 const {data:agency,error:agencyError}=await admin().auth.admin.getUserById(deal.user_id);
 const to=agency?.user?.email;
 const key=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL;
 let emailSent=false;
 const amount=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(deal.amount||0)*0.5);
 if(!agencyError&&to&&key&&from){
  try{
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject:"UPI payment reported for a Deal Room",text:`Client ${deal.client_name} claims to have paid ${amount} via UPI. Please verify and mark as paid.\nProject: ${deal.project_title}\nDeal ID: ${deal.id}\nDo not mark as paid until the funds appear in your bank/UPI account.`})});
   if(!response.ok)console.error("UPI agency notification email failed",response.status,(await response.text()).slice(0,250));else emailSent=true;
  }catch(e){console.error("UPI agency notification email error",e);}
 }else console.error("UPI agency notification email not configured or agency email unavailable");
 return Response.json({ok:true,recorded:true,emailSent});
}
