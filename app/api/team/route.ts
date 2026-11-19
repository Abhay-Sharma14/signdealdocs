import {admin,owner,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
async function context(request:Request){
 const user=await owner(request);if(!user)return null;
 const {data:billing,error}=await admin().from("billing_profiles").select("plan").eq("user_id",user.id).maybeSingle();
 if(error)throw Error("Billing unavailable");
 return {user,plan:billing?.plan||"starter"};
}
export async function GET(request:Request){
 try{
  const ctx=await context(request);if(!ctx)return jsonError("Sign in required.",401);
  const {data,error}=await admin().from("team_members").select("id,member_email,role,created_at").eq("agency_id",ctx.user.id).order("created_at",{ascending:true});
  if(error)return jsonError("Team members unavailable. Apply team migration.",503);
  return Response.json({plan:ctx.plan,limit:ctx.plan==="agency"?10:ctx.plan==="pro"?3:1,members:data||[],owner_email:ctx.user.email},{headers:{"Cache-Control":"no-store"}});
 }catch{return jsonError("Team settings unavailable.",503);}
}
export async function POST(request:Request){
 try{
  const ctx=await context(request);if(!ctx)return jsonError("Sign in required.",401);
  if(ctx.plan!=="pro"&&ctx.plan!=="agency")return jsonError("Upgrade required",403);
  let body:unknown;try{body=await request.json();}catch{return jsonError("Invalid JSON.",400);}
  if(!body||typeof body!=="object")return jsonError("Invalid request.",400);
  const input=body as Record<string,unknown>;
  const email=typeof input.email==="string"?input.email.trim().toLowerCase():"";
  const role=input.role==="admin"?"admin":input.role==="member"?"member":null;
  if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||email.length>254||!role)return jsonError("Valid email and role are required.",400);
  if(email===ctx.user.email?.toLowerCase())return jsonError("The owner is already a team member.",409);
  const {data,error}=await admin().rpc("invite_team_member",{p_owner:ctx.user.id,p_email:email,p_role:role});
  if(error){if(error.code==="P0001"||error.message.includes("Upgrade required"))return jsonError("Upgrade required",403);if(error.code==="23505")return jsonError("Member already exists.",409);console.error("Team invite failed",error.code,error.message);return jsonError("Could not add member.",503);}
  return Response.json({id:data,member_email:email,role,status:"recorded"},{status:201});
 }catch{return jsonError("Team service unavailable.",503);}
}
export async function DELETE(request:Request){
 const ctx=await context(request).catch(()=>null);if(!ctx)return jsonError("Sign in required.",401);
 const id=new URL(request.url).searchParams.get("id");
 if(!id||!/^[a-f0-9-]{36}$/i.test(id))return jsonError("Invalid member.",400);
 const {data,error}=await admin().from("team_members").delete().eq("agency_id",ctx.user.id).eq("id",id).select("id").maybeSingle();
 if(error)return jsonError("Could not remove member.",503);
 if(!data)return jsonError("Member not found.",404);
 return Response.json({ok:true});
}
