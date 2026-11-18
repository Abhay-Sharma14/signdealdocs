import { randomUUID } from "node:crypto";
import {newDealSlug} from "@/lib/deal-slug";
import {PDFDocument} from "pdf-lib";
import {admin,BUCKET,owner,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
export async function POST(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 if(Number(request.headers.get("content-length")||0)>7_000_000)return jsonError("Uploads too large.",413);
 let form:FormData;try{form=await request.formData();}catch{return jsonError("Invalid form.",400);}
 const client_name=String(form.get("client_name")||"").trim().slice(0,120);
 const client_email=String(form.get("client_email")||"").trim().toLowerCase();
 const project_title=String(form.get("project_title")||"Project Proposal").trim().slice(0,160);
 const amount=Number(form.get("amount")||0);
 const brand_name=String(form.get("brand_name")||"").trim().slice(0,100);
 const brand_color=String(form.get("brand_color")||"#4f46e5");
 if(!client_name||!/^\S+@\S+\.\S+$/.test(client_email)||!Number.isFinite(amount)||amount<0||amount>1e9||!/^#[0-9a-fA-F]{6}$/.test(brand_color))return jsonError("Check client, amount and brand color.",400);
 const proposal=form.get("proposal"),contract=form.get("contract");
 if(!(proposal instanceof File)||!(contract instanceof File))return jsonError("Proposal and contract PDFs are required.",400);
 const uploads:{type:string;file:File;path:string}[]=[];
 const dealId=randomUUID();
 for(const [type,file] of [["proposal",proposal],["contract",contract]] as [string,File][]){
  if(file.size<100||file.size>3_000_000||file.type!=="application/pdf")return jsonError("Each PDF must be valid and under 3 MB.",400);
  const bytes=Buffer.from(await file.arrayBuffer());
  try{const pdf=await PDFDocument.load(bytes);if(!pdf.getPageCount())throw Error();}catch{return jsonError("Invalid or encrypted PDF.",415);}
  const path=`rooms/${user.id}/${dealId}/${type}.pdf`;
  const {error}=await admin().storage.from(BUCKET).upload(path,bytes,{contentType:"application/pdf",upsert:false});
  if(error){await admin().storage.from(BUCKET).remove(uploads.map(u=>u.path));return jsonError("Could not store PDFs.",500);}
  uploads.push({type,file,path});
 }
 let slug="";
 let inserted=false;
 for(let attempt=0;attempt<5;attempt++){
  slug=newDealSlug();
  const {error}=await admin().from("deals").insert({id:dealId,user_id:user.id,slug,client_name,client_email,project_title,amount,currency:"USD",status:"sent",brand_name:brand_name||null,brand_color,required_documents:[],proposal:null});
  if(!error){inserted=true;break;}
  if(error.code!=="23505"){await admin().storage.from(BUCKET).remove(uploads.map(u=>u.path));return jsonError("Could not create deal. Check database migration.",500);}
 }
 if(!inserted){await admin().storage.from(BUCKET).remove(uploads.map(u=>u.path));return jsonError("Could not generate unique deal link. Retry.",503);}
 const rows=[
  {deal_id:dealId,type:"proposal",title:"Project Proposal",pdf_url:uploads[0].path,sort_order:1},
  {deal_id:dealId,type:"contract",title:"Service Agreement",pdf_url:uploads[1].path,sort_order:2},
  {deal_id:dealId,type:"invoice",title:"Initial Deposit",sort_order:3},
  {deal_id:dealId,type:"file_request",title:"Brand Assets",sort_order:4}
 ];
 const {error:itemError}=await admin().from("deal_items").insert(rows);
 if(itemError){await admin().from("deals").delete().eq("id",dealId).eq("user_id",user.id);await admin().storage.from(BUCKET).remove(uploads.map(u=>u.path));return jsonError("Could not create deal items.",500);}
 await admin().from("audit_log").insert({deal_id:dealId,action:"created",actor_email:user.email});
 return Response.json({id:dealId,shareToken:slug,url:`/d/${slug}`},{status:201});
}
export async function DELETE(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 const id=new URL(request.url).searchParams.get("id");
 if(!id||!/^[a-f0-9-]{36}$/i.test(id))return jsonError("Invalid deal.",400);
 const {data:deal}=await admin().from("deals").select("id,status").eq("id",id).eq("user_id",user.id).maybeSingle();
 if(!deal)return jsonError("Deal not found.",404);
 if(["signed","completed"].includes(deal.status))return jsonError("Signed deals must be retained or archived, not deleted.",409);
 const {error}=await admin().from("deals").delete().eq("id",id).eq("user_id",user.id);
 if(error)return jsonError("Could not delete deal.",500);
 return Response.json({ok:true});
}
