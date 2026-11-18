import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ensureSignedPdf, pdfResponse, type SignatureRecord } from "@/lib/signed-pdf";
export const runtime = "nodejs";
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,{params}:Context){
 const bearer=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!bearer)return NextResponse.json({error:"Sign in required."},{status:401});
 const admin=getSupabaseAdmin();
 const {data:auth,error:authError}=await admin.auth.getUser(bearer);
 if(authError||!auth.user)return NextResponse.json({error:"Sign in required."},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Not found."},{status:404});
 const {data:row,error}=await admin.from("signature_requests").select("*").eq("id",id).eq("owner_id",auth.user.id).maybeSingle();
 if(error||!row)return NextResponse.json({error:"Not found."},{status:404});
 if(!row.signed_at||!row.signature_path)return NextResponse.json({error:"Document is not signed yet."},{status:409});
 try{const {bytes}=await ensureSignedPdf(row as SignatureRecord);return pdfResponse(bytes,row.original_name);}
 catch{return NextResponse.json({error:"Signed PDF is temporarily unavailable. Please try again."},{status:503});}
}
