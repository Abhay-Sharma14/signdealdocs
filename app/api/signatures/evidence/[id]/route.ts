import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export const runtime="nodejs";
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,{params}:Context){
 const bearer=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!bearer)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:auth,error:authError}=await getSupabaseAdmin().auth.getUser(bearer);
 if(authError||!auth.user)return NextResponse.json({error:"Unauthorized."},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Not found."},{status:404});
 const {data:row}=await getSupabaseAdmin().from("signature_requests")
 .select("id,title,original_name,signer_name,signer_email,signed_at,created_at")
 .eq("id",id).eq("owner_id",auth.user.id).maybeSingle();
 if(!row)return NextResponse.json({error:"Not found."},{status:404});
 const {data:events,error}=await getSupabaseAdmin().from("signature_events")
 .select("event_type,created_at,signer_name,consent_text,document_sha256,signature_sha256,user_agent,ip_sha256")
 .eq("signature_request_id",id).order("created_at",{ascending:true});
 if(error)return NextResponse.json({error:"Audit evidence unavailable. Apply the audit migration."},{status:503});
 return NextResponse.json({request:row,events:events??[],notice:"Evidence record, not a cryptographic PDF seal or independent identity certification."},{headers:{"Cache-Control":"no-store, private"}});
}
