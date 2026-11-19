import { createHash, createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ensureSignedPdf } from "@/lib/signed-pdf";
import { PDFDocument } from "pdf-lib";
export const runtime="nodejs";
const bucket="deal-vault";
type Context={params:Promise<{token:string}>};
async function find(token:string){
 if(!/^(?:[A-Za-z0-9]{16}|[a-f0-9]{64})$/.test(token))return null;
 const {data}=await getSupabaseAdmin().from("signature_requests").select("*").eq("token",token).maybeSingle();
 if(!data||data.revoked_at||new Date(data.expires_at).getTime()<=Date.now())return null;
 return data;
}
export async function GET(_request:Request,{params}:Context){
 const {token}=await params;
 const row=await find(token);
 if(!row)return NextResponse.json({error:"This signature link is unavailable or expired."},{status:404});
 const storage=getSupabaseAdmin().storage.from(bucket);
 const {data:pdf}=await storage.createSignedUrl(row.document_path,300);
 let pages:{width:number;height:number}[]=[];
 if(!row.signed_at){const source=await storage.download(row.document_path);if(!source.error&&source.data){try{const doc=await PDFDocument.load(await source.data.arrayBuffer());pages=doc.getPages().map(p=>({width:p.getWidth(),height:p.getHeight()}));}catch{}}}
 const {data:signature}=row.signature_path?await storage.createSignedUrl(row.signature_path,300):{data:null};
 return NextResponse.json({title:row.title,signer_name:row.signer_name,original_name:row.original_name,pdf_url:pdf?.signedUrl??null,signature_url:signature?.signedUrl??null,signed_at:row.signed_at,pages},{headers:{"Cache-Control":"no-store, private","Referrer-Policy":"no-referrer"}});
}
export async function POST(request:Request,{params}:Context){
 const {token}=await params;
 const row=await find(token);
 if(!row)return NextResponse.json({error:"Link unavailable."},{status:404});
 if(row.signed_at)return NextResponse.json({error:"Already signed."},{status:409});
 const length=Number(request.headers.get("content-length")??"0");
 if(length>600_000)return NextResponse.json({error:"Signature too large."},{status:413});
 let form:FormData;
 try{form=await request.formData();}catch{return NextResponse.json({error:"Invalid signature."},{status:400});}
 const name=String(form.get("name")??"").trim();
 const consent=form.get("consent")==="yes";
 const file=form.get("signature");
 if(name.toLocaleLowerCase()!==String(row.signer_name).trim().toLocaleLowerCase()||!consent||!(file instanceof File)||file.size<40||file.size>250_000||file.type!=="image/png")
 return NextResponse.json({error:"Confirm signer name, consent and drawn signature."},{status:400});
 const bytes=Buffer.from(await file.arrayBuffer());
 if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return NextResponse.json({error:"Invalid PNG signature."},{status:415});
 try{const probe=await PDFDocument.create();await probe.embedPng(bytes);}catch{return NextResponse.json({error:"Signature PNG could not be decoded."},{status:415});}
 const path=`signatures/${row.owner_id}/${randomUUID()}-signed.png`;
 const storage=getSupabaseAdmin().storage.from(bucket);
 const {error:uploadError}=await storage.upload(path,bytes,{contentType:"image/png",upsert:false});
 if(uploadError)return NextResponse.json({error:"Could not store signature."},{status:500});
 const signedAt=new Date().toISOString();
 const {data,error}=await getSupabaseAdmin().from("signature_requests").update({signature_path:path,signed_at:signedAt,consent_text:"I reviewed the document and agree to sign electronically."}).eq("id",row.id).is("signed_at",null).is("revoked_at",null).gt("expires_at",signedAt).select("id").maybeSingle();
 if(error||!data){
  await storage.remove([path]);
  if(error){
   console.error("Signature finalization database update failed",{code:error.code,message:error.message,details:error.details,hint:error.hint,requestId:row.id});
   return NextResponse.json({error:"Unable to save the signature due to a server configuration error. Please contact support.",code:"SIGNATURE_SAVE_FAILED"},{status:500});
  }
  console.warn("Signature finalization rejected by conditional update",{requestId:row.id});
  return NextResponse.json({error:"This signing request was already completed, revoked, or expired. Refresh to see its latest status.",code:"SIGNATURE_REQUEST_CHANGED"},{status:409});
 }
 const {data:original,error:downloadError}=await storage.download(row.document_path);
 const documentHash=!downloadError&&original?createHash("sha256").update(Buffer.from(await original.arrayBuffer())).digest("hex"):"";
 const signatureHash=createHash("sha256").update(bytes).digest("hex");
 const agent=request.headers.get("user-agent")?.slice(0,500)??null;
 const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"";
 const auditSecret=process.env.AUDIT_HASH_SECRET;
 const ipHash=ip&&auditSecret?createHmac("sha256",auditSecret).update(ip).digest("hex"):null;
 let evidenceSaved=false;
 if(documentHash){
  const {error:auditError}=await getSupabaseAdmin().from("signature_events").insert({
   signature_request_id:row.id,event_type:"signed",signer_name:name,
   consent_text:"I reviewed the document and agree to sign electronically.",
   document_sha256:documentHash,signature_sha256:signatureHash,user_agent:agent,ip_sha256:ipHash
  });
  evidenceSaved=!auditError;
 }
 let pdfReady=false;
 let completedPdf:Buffer|null=null;
 try {const result=await ensureSignedPdf({...row,signature_page:null,signature_x:null,signature_y:null,signature_width:null,signature_height:null,signature_path:path,signed_at:signedAt});completedPdf=result.bytes;pdfReady=true;const {error:recordError}=await getSupabaseAdmin().from("signature_requests").update({completed_pdf_path:result.path}).eq("id",row.id);if(recordError)console.error("Could not record completed PDF path",recordError);}catch(error){console.error("Completed PDF generation failed",error);}
 let clientEmailSent=false,agencyEmailSent=false;
 const apiKey=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL;
 if(apiKey&&from&&completedPdf){
  const base=(process.env.NEXT_PUBLIC_APP_URL||process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin).replace(/\/$/,"");
  const downloadUrl=`${base}/api/signatures/${encodeURIComponent(token)}/download`;
  const escape=(value:string)=>value.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]||ch));
  const send=async(to:string,subject:string,message:string)=>{
   try{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject,text:message,html:`<p>${escape(message).replace(/\n/g,"<br/>")}</p><p><a href="${escape(downloadUrl)}">Download signed PDF</a></p>`,attachments:[{filename:"signed-document.pdf",content:completedPdf!.toString("base64")}]})});
    if(!response.ok)console.error("Signed PDF notification failed",{status:response.status,detail:(await response.text()).slice(0,400)});
    return response.ok;
   }catch(err){console.error("Signed PDF notification error",err);return false;}
  };
  let ownerEmail:string|undefined;
  try {const owner=await getSupabaseAdmin().auth.admin.getUserById(row.owner_id);ownerEmail=owner.data.user?.email;}catch(err){console.error("Could not resolve agency owner email",err);}
  const ownerMessage=`Good news! ${row.signer_name} has signed the document ${row.title}. You can download the signed PDF here: ${downloadUrl}`;
  const clientMessage=`Your signed document "${row.title}" is attached. You can also download it here: ${downloadUrl}`;
  const notifications=await Promise.all([
   row.signer_email?send(row.signer_email,`Your signed document: ${row.title}`,clientMessage):Promise.resolve(false),
   ownerEmail?send(ownerEmail,`Document signed: ${row.title}`,ownerMessage):Promise.resolve(false)
  ]);
  [clientEmailSent,agencyEmailSent]=notifications;
 }
 return NextResponse.json({signed_at:signedAt,evidence_saved:evidenceSaved,pdf_ready:pdfReady,client_email_sent:clientEmailSent,agency_email_sent:agencyEmailSent},{headers:{"Cache-Control":"no-store"}});
}
