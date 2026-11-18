import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
export const BUCKET="deal-vault";
export const admin=()=>getSupabaseAdmin();
export const tokenValid=(token:string)=>/^[a-f0-9]{64}$/i.test(token);
export async function publicDeal(token:string){
 if(!tokenValid(token))return null;
 const {data}=await admin().from("deals").select("*").eq("slug",token).maybeSingle();
 if(!data||data.link_revoked_at||(data.link_expires_at&&Date.parse(data.link_expires_at)<=Date.now())||data.status==="draft")return null;
 return data;
}
export async function owner(request:Request){
 const jwt=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!jwt)return null;
 const {data,error}=await admin().auth.getUser(jwt);
 return error?null:data.user;
}
export async function urlFor(path:string|null){
 if(!path)return null;
 const {data}=await admin().storage.from(BUCKET).createSignedUrl(path,300);
 return data?.signedUrl??null;
}
export function jsonError(message:string,status:number){return Response.json({error:message},{status,headers:{"Cache-Control":"no-store"}});}
