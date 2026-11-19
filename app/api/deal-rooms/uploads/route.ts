import {admin,owner,urlFor,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
export async function GET(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 const id=new URL(request.url).searchParams.get("id");
 if(!id||!/^[a-f0-9-]{36}$/i.test(id))return jsonError("Invalid deal ID.",400);
 const {data:deal,error:dealError}=await admin().from("deals").select("id,client_name,project_title").eq("id",id).eq("user_id",user.id).maybeSingle();
 if(dealError)return jsonError("Could not load deal.",500);
 if(!deal)return jsonError("Deal not found.",404);
 const {data:items,error:itemError}=await admin().from("deal_items").select("id").eq("deal_id",id).eq("type","file_request");
 if(itemError)return jsonError("Could not load file requests.",500);
 const ids=(items||[]).map(i=>i.id);
 if(!ids.length)return Response.json({deal,uploads:[]},{headers:{"Cache-Control":"no-store"}});
 const {data:uploads,error}=await admin().from("deal_uploads").select("id,file_name,file_url,created_at,uploaded_by").in("deal_item_id",ids).order("created_at",{ascending:false});
 if(error)return jsonError("Could not load uploads.",500);
 const results=await Promise.all((uploads||[]).map(async file=>({id:file.id,name:file.file_name,created_at:file.created_at,uploaded_by:file.uploaded_by,url:await urlFor(file.file_url)})));
 return Response.json({deal,uploads:results},{headers:{"Cache-Control":"no-store, private"}});
}
