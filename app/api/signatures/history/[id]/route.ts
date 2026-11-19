import {NextResponse} from "next/server";
import {getSupabaseAdmin} from "@/lib/supabase-admin";
import {ensureSignedPdf,pdfResponse,type SignatureRecord} from "@/lib/signed-pdf";
export const runtime="nodejs";
type Context={params:Promise<{id:string}>};
async function owned(request:Request,id:string){
 const token=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!token)return {status:401 as const,row:null};
 const {data:auth,error:authError}=await getSupabaseAdmin().auth.getUser(token);
 if(authError||!auth.user)return {status:401 as const,row:null};
 if(!/^[a-f0-9-]{36}$/i.test(id))return {status:404 as const,row:null};
 const {data:row,error}=await getSupabaseAdmin().from("signature_requests").select("*").eq("id",id).eq("owner_id",auth.user.id).eq("type","quick_sign").is("revoked_at",null).maybeSingle();
 if(error||!row)return {status:404 as const,row:null};
 return {status:200 as const,row};
}
export async function GET(request:Request,{params}:Context){
 const {id}=await params;const result=await owned(request,id);
 if(!result.row)return NextResponse.json({error:result.status===401?"Sign in required.":"Signature not found."},{status:result.status});
 if(!result.row.signed_at)return NextResponse.json({error:"Signature is not complete."},{status:409});
 try{const {bytes}=await ensureSignedPdf(result.row as SignatureRecord);return pdfResponse(bytes,result.row.original_name);}
 catch(error){console.error("Owner signed PDF download failed",error);return NextResponse.json({error:"Signed PDF temporarily unavailable."},{status:503});}
}
export async function DELETE(request:Request,{params}:Context){
 const {id}=await params;const result=await owned(request,id);
 if(!result.row)return NextResponse.json({error:result.status===401?"Sign in required.":"Signature not found."},{status:result.status});
 // Soft-delete: preserve signed evidence and private PDF for record retention; revoke public link.
 const {error}=await getSupabaseAdmin().from("signature_requests").update({revoked_at:new Date().toISOString()}).eq("id",id).eq("owner_id",result.row.owner_id).is("revoked_at",null);
 if(error)return NextResponse.json({error:"Could not remove signature from history."},{status:500});
 return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}
