import {randomUUID,createHash} from "node:crypto";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import {admin,BUCKET,publicDeal,jsonError,urlFor} from "@/lib/deal-room";
export const runtime="nodejs";
type C={params:Promise<{shareToken:string;itemId:string}>};
export async function POST(request:Request,{params}:C){
 const {shareToken,itemId}=await params;const deal=await publicDeal(shareToken);
 if(!deal)return jsonError("Link expired or revoked.",404);
 if(Number(request.headers.get("content-length")||0)>500_000)return jsonError("Signature too large.",413);
 let body:{signatureImage?:unknown;consent?:unknown};
 try{body=await request.json();}catch{return jsonError("Invalid request.",400);}
 if(body.consent!==true||typeof body.signatureImage!=="string"||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(body.signatureImage)||body.signatureImage.length>350_000)return jsonError("Valid PNG signature and consent required.",400);
 const png=Buffer.from(body.signatureImage.split(",")[1],"base64");
 if(png.length<40||png.length>250_000||png.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")return jsonError("Invalid PNG.",415);
 const {data:item}=await admin().from("deal_items").select("*").eq("id",itemId).eq("deal_id",deal.id).eq("type","contract").maybeSingle();
 if(!item||!item.pdf_url)return jsonError("Contract unavailable.",404);
 if(item.status==="signed"||item.signed_pdf_url)return jsonError("Contract already signed.",409);
 const {data:source,error:sourceError}=await admin().storage.from(BUCKET).download(item.pdf_url);
 if(sourceError||!source)return jsonError("Contract PDF unavailable.",503);
 const original=Buffer.from(await source.arrayBuffer());
 let signed:Uint8Array;
 try{
  const pdf=await PDFDocument.load(original);
  const image=await pdf.embedPng(png);
  const page=pdf.getPage(pdf.getPageCount()-1);
  const font=await pdf.embedFont(StandardFonts.Helvetica);
  const w=Math.min(150,page.getWidth()-48),h=50,x=page.getWidth()-w-24,y=65;
  page.drawRectangle({x:x-4,y:y-29,width:w+8,height:h+55,color:rgb(1,1,1)});
  page.drawImage(image,{x,y,width:w,height:h});
  const stamp=`Signed by ${deal.client_name.normalize("NFKD").replace(/[^\x20-\x7e]/g,"?").slice(0,65)} on ${new Date().toISOString()}`;
  page.drawText(stamp,{x:Math.max(12,x-20),y:y-15,font,size:7,color:rgb(.12,.16,.25),maxWidth:page.getWidth()-24});
  pdf.setSubject("Electronically signed via SignDealDocs Deal Room");
  signed=await pdf.save();
 }catch{return jsonError("Could not process contract or signature.",415);}
 const path=`rooms/${deal.user_id}/${deal.id}/signed-${item.id}-${randomUUID()}.pdf`;
 const {error:uploadError}=await admin().storage.from(BUCKET).upload(path,signed,{contentType:"application/pdf",upsert:false});
 if(uploadError)return jsonError("Could not save signed PDF.",503);
 const {data:updated,error}=await admin().from("deal_items").update({signed_pdf_url:path,status:"signed"}).eq("id",item.id).eq("deal_id",deal.id).eq("status","pending").is("signed_pdf_url",null).select("id").maybeSingle();
 if(error||!updated){await admin().storage.from(BUCKET).remove([path]);return jsonError("Contract state changed. Refresh.",409);}
 await admin().from("deals").update({status:"signed",signed_at:new Date().toISOString()}).eq("id",deal.id).eq("status","sent");
 const {data:audit}=await admin().from("audit_log").insert({deal_id:deal.id,action:"signed",actor_email:deal.client_email}).select("id").maybeSingle();
 return Response.json({ok:true,signedPdfUrl:await urlFor(path),auditId:audit?.id??null,originalSha256:createHash("sha256").update(original).digest("hex")});
}
