import {randomUUID} from "node:crypto";
import {admin,BUCKET,publicDeal,jsonError,urlFor} from "@/lib/deal-room";
import {hasValidDocumentSignature} from "@/lib/document-upload";
export const runtime="nodejs";
type C={params:Promise<{shareToken:string;itemId:string}>};
export async function POST(request:Request,{params}:C){
 const {shareToken,itemId}=await params;const deal=await publicDeal(shareToken);
 if(!deal)return jsonError("Link expired or revoked.",404);
 if(Number(request.headers.get("content-length")||0)>10_000_000)return jsonError("File exceeds 8 MB.",413);
 const {data:item}=await admin().from("deal_items").select("*").eq("id",itemId).eq("deal_id",deal.id).eq("type","file_request").maybeSingle();
 if(!item)return jsonError("File request unavailable.",404);
 let form:FormData;try{form=await request.formData();}catch{return jsonError("Invalid upload.",400);}
 const file=form.get("file");if(!(file instanceof File)||file.size<1||file.size>8_000_000)return jsonError("Choose a file under 8 MB.",400);
 const types=new Set(["application/pdf","image/png","image/jpeg","image/webp"]);
 if(!types.has(file.type))return jsonError("Use PDF, PNG, JPG or WebP.",415);
 const bytes=Buffer.from(await file.arrayBuffer());
 if(!hasValidDocumentSignature(bytes,file.type))return jsonError("File content invalid.",415);
 const path=`rooms/${deal.user_id}/${deal.id}/uploads/${randomUUID()}`;
 const {error:storageError}=await admin().storage.from(BUCKET).upload(path,bytes,{contentType:file.type,upsert:false});
 if(storageError)return jsonError("Upload failed.",500);
 const {error}=await admin().from("deal_uploads").insert({deal_item_id:item.id,file_url:path,file_name:file.name.slice(0,180),uploaded_by:"client"});
 if(error){await admin().storage.from(BUCKET).remove([path]);return jsonError("Could not save upload.",500);}
 await admin().from("deal_items").update({status:"uploaded"}).eq("id",item.id);
 await admin().from("audit_log").insert({deal_id:deal.id,action:"uploaded",actor_email:deal.client_email});
 return Response.json({ok:true,fileName:file.name,url:await urlFor(path)});
}
