import {admin,owner,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
export async function GET(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 const {data,error}=await admin().from("billing_profiles").select("plan,subscription_status").eq("user_id",user.id).maybeSingle();
 if(error)return jsonError("Billing database unavailable. Apply migration.",503);
 return Response.json({plan:data?.plan||"starter",status:data?.subscription_status||null},{headers:{"Cache-Control":"no-store"}});
}
