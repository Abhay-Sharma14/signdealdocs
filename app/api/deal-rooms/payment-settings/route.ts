import {validCurrency} from "@/lib/deal-currency";
import {validatePaymentLink} from "@/lib/payment-link";
import {randomUUID} from "node:crypto";
import {admin,BUCKET,owner,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
export async function PUT(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 if(Number(request.headers.get("content-length")||0)>2_000_000)return jsonError("Upload too large.",413);
 let form:FormData;try{form=await request.formData();}catch{return jsonError("Invalid form.",400);}
 const id=String(form.get("id")||"");
 const method=String(form.get("payment_method")||"");
 if(!/^[a-f0-9-]{36}$/i.test(id)||!["auto","manual_upi","payment_link"].includes(method))return jsonError("Invalid payment settings.",400);
 const {data:deal,error:readError}=await admin().from("deals").select("id,user_id,status,payment_method,upi_qr_path,payment_link,currency,amount,paid_at,payment_notified_at").eq("id",id).eq("user_id",user.id).maybeSingle();
 if(readError)return jsonError("Could not load deal.",500);
 if(!deal)return jsonError("Deal not found.",404);
 if(deal.paid_at||deal.status==="paid")return jsonError("Paid deals cannot be edited.",409);
 if(deal.payment_notified_at)return jsonError("Payment has been reported. Verify or resolve it before editing payment settings.",409);
 const currency=method==="manual_upi"?"INR":String(form.get("currency")||deal.currency);
 if(!validCurrency(currency))return jsonError("Invalid deal currency.",400);
 const changingCurrency=deal.currency!==currency;
 const amountValue=form.get("amount");
 const amount=changingCurrency?Number(amountValue):Number(deal.amount);
 if(changingCurrency&&(amountValue===null||String(amountValue).trim()===""))return jsonError("Enter the total deal amount in the new currency.",400);
 if(!Number.isFinite(amount)||amount<=0||amount>1e9)return jsonError("Enter a valid deal amount.",400);
 const payment_link=method==="payment_link"?validatePaymentLink(String(form.get("payment_link")||"")):null;
 if(method==="payment_link"&&!payment_link)return jsonError("Enter a valid HTTPS payment link.",400);
 const file=form.get("upi_qr");
 const hasFile=file instanceof File&&file.size>0;
 if(method==="manual_upi"&&!hasFile&&!deal.upi_qr_path)return jsonError("Upload a UPI QR image.",400);
 let newPath:string|null=method==="manual_upi"?deal.upi_qr_path:null;
 if(method==="manual_upi"&&hasFile&&file instanceof File){
  if(file.size>1_000_000||!["image/png","image/jpeg"].includes(file.type))return jsonError("QR image must be PNG/JPG under 1 MB.",400);
  const bytes=Buffer.from(await file.arrayBuffer());
  const valid=file.type==="image/png"?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  if(!valid)return jsonError("Invalid QR image.",415);
  newPath=`rooms/${user.id}/${id}/upi-qr-${randomUUID()}`;
  const {error:uploadError}=await admin().storage.from(BUCKET).upload(newPath,bytes,{contentType:file.type,upsert:false});
  if(uploadError)return jsonError("Could not upload QR image.",500);
 }
 const {data:updated,error}=await admin().from("deals").update({payment_method:method,payment_link,upi_qr_path:newPath,currency,amount}).eq("id",id).eq("user_id",user.id).is("paid_at",null).is("payment_notified_at",null).select("id").maybeSingle();
 if(error||!updated){if(newPath&&newPath!==deal.upi_qr_path)await admin().storage.from(BUCKET).remove([newPath]);console.error("Deal payment settings update failed",error);return jsonError("Could not update payment settings.",500);}
 const {error:auditError}=await admin().from("audit_log").insert({deal_id:id,action:"payment_settings_updated",actor_email:user.email});
 if(auditError)console.error("Payment settings audit insert failed",auditError);
 if(deal.upi_qr_path&&deal.upi_qr_path!==newPath)await admin().storage.from(BUCKET).remove([deal.upi_qr_path]);
 return Response.json({ok:true});
}
