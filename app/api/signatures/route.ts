import { randomInt, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PDFDocument } from "pdf-lib";
export const runtime = "nodejs";
const bucket = "deal-vault";
async function owner(request: Request) {
 const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if (!token) return null;
 const { data, error } = await getSupabaseAdmin().auth.getUser(token);
 return error ? null : data.user;
}
export async function GET(request: Request) {
 const user = await owner(request);
 if (!user) return NextResponse.json({error:"Sign in required."},{status:401});
 const completedOnly=new URL(request.url).searchParams.get("status")==="signed";
 const db=getSupabaseAdmin();
 // Base columns are available in the original standalone-signatures migration.
 // Keep history readable if the optional quick_sign classification migration is pending.
 const baseColumns="id,token,title,signer_name,signer_email,original_name,signed_at,created_at,expires_at,revoked_at";
 const fetchHistory=async(withType:boolean)=>{
  let query=db.from("signature_requests").select(withType?`${baseColumns},type,completed_pdf_path`:baseColumns)
   .eq("owner_id",user.id).is("revoked_at",null)
   .order("created_at",{ascending:false}).limit(100);
  if(withType)query=query.eq("type","quick_sign");
  if(completedOnly)query=query.not("signed_at","is",null);
  return await query;
 };
 let {data,error}=await fetchHistory(true);
 if(error&&["42703","PGRST204","PGRST205"].includes(error.code||"")){
  console.warn("Quick Sign history migration columns unavailable; using legacy signature fields.",error.code);
  ({data,error}=await fetchHistory(false));
 }
 if(error){
  console.error("Quick Sign history query failed",{code:error.code,message:error.message,details:error.details});
  return NextResponse.json({error:"Could not load Quick Sign History. Check the signature_requests database migration.",code:error.code||"DATABASE_ERROR"},{status:503,headers:{"Cache-Control":"no-store"}});
 }
 return NextResponse.json({requests:data||[]},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request: Request) {
 const user=await owner(request);
 if (!user) return NextResponse.json({error:"Sign in required."},{status:401});
 const length=Number(request.headers.get("content-length")??"0");
 if (length>17_000_000) return NextResponse.json({error:"PDF must be under 15 MB."},{status:413});
 let form:FormData;
 try {form=await request.formData();} catch {return NextResponse.json({error:"Invalid form."},{status:400});}
 const title=String(form.get("title")??"").trim().slice(0,160);
 const signerName=String(form.get("signer_name")??"").trim().slice(0,120);
 const signerEmail=String(form.get("signer_email")??"").trim().toLowerCase();
 const file=form.get("file");
 const expirationDays=Number(form.get("expiration_days")||7);
 if(![7,14,30].includes(expirationDays))return NextResponse.json({error:"Invalid link expiration."},{status:400});
 if(!title||!signerName||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signerEmail)||!(file instanceof File)||file.size<5||file.size>15_000_000)
  return NextResponse.json({error:"Provide title, signer details and a PDF under 15 MB."},{status:400});
 const bytes=Buffer.from(await file.arrayBuffer());
 if(bytes.subarray(0,5).toString()!=="%PDF-")return NextResponse.json({error:"Only valid PDF files are supported."},{status:415});
 try {const pdf=await PDFDocument.load(bytes);if(pdf.getPageCount()<1)throw Error("No pages");}catch{return NextResponse.json({error:"Upload a valid, unencrypted PDF."},{status:415});}
 // 16 base62 characters provide approximately 95 bits of randomness. 
 // Existing 64-character links remain valid for previously sent invitations. 
 const alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
 const token=Array.from({length:16},()=>alphabet[randomInt(alphabet.length)]).join("");
 const path=`signatures/${user.id}/${randomUUID()}.pdf`;
 const storage=getSupabaseAdmin().storage.from(bucket);
 const {error:uploadError}=await storage.upload(path,bytes,{contentType:"application/pdf",upsert:false});
 if(uploadError)return NextResponse.json({error:"Could not upload PDF."},{status:500});
 const {data,error}=await getSupabaseAdmin().from("signature_requests").insert({owner_id:user.id,type:"quick_sign",token,title,signer_name:signerName,signer_email:signerEmail,original_name:file.name.slice(0,180),document_path:path,expires_at:new Date(Date.now()+expirationDays*86400000).toISOString()}).select("id,token").single();
 if(error){await storage.remove([path]);return NextResponse.json({error:"Could not create signature request. Apply the database migration first."},{status:500});}
 const {data:settings}=await getSupabaseAdmin().from("agency_settings").select("agency_name").eq("owner_id",user.id).maybeSingle();
 const agencyName=(settings?.agency_name||"SignDealDocs").slice(0,100);
  const baseSite=process.env.NEXT_PUBLIC_APP_URL||process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin; const site=baseSite.endsWith("/")?baseSite.slice(0,-1):baseSite;
 const signingUrl=`${site}/sign/${token}`;
 let emailSent=false;
 const apiKey=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL;
 if(apiKey&&from){
  try{
   const escape=(v:string)=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
   const message=`${agencyName} has requested your signature on ${title}.`;
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[signerEmail],subject:`Signature requested: ${title}`,text:`${message} 
 
Review and sign: ${signingUrl} 
 
This link expires after ${expirationDays} days.`,html:`<p>${escape(message)}</p><p><a href="${escape(signingUrl)}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">Review and sign document</a></p><p>This link expires after 7 days.</p>`})});
   emailSent=response.ok;
   if(!response.ok){const detail=await response.text();console.error("Resend signature email failed",response.status,detail.slice(0,500));}
  }catch(error){console.error("Resend signature email delivery error",error);}
 }else{
  console.error("Resend signature email skipped: RESEND_API_KEY or RESEND_FROM_EMAIL is missing.");
 }
 return NextResponse.json({request:data,email_sent:emailSent},{status:201,headers:{"Cache-Control":"no-store"}});
}
