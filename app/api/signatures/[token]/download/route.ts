import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ensureSignedPdf, pdfResponse, type SignatureRecord } from "@/lib/signed-pdf";
export const runtime = "nodejs";
type Context = {params:Promise<{token:string}>};
export async function GET(_request:Request,{params}:Context){
 const {token}=await params;
 if(!/^[a-f0-9]{64}$/.test(token))return NextResponse.json({error:"Link unavailable."},{status:404});
 const {data:row,error}=await getSupabaseAdmin().from("signature_requests").select("*").eq("token",token).maybeSingle();
 if(error||!row||row.revoked_at||new Date(row.expires_at).getTime()<=Date.now())return NextResponse.json({error:"Link unavailable or expired."},{status:404});
 if(!row.signed_at||!row.signature_path)return NextResponse.json({error:"Document is not signed yet."},{status:409});
 try{const {bytes}=await ensureSignedPdf(row as SignatureRecord);return pdfResponse(bytes,row.original_name);}
 catch{return NextResponse.json({error:"Signed PDF is temporarily unavailable. Please try again."},{status:503});}
}
