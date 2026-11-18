import {admin,owner,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
export async function GET(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 const {data,error}=await admin().from("agency_settings").select("agency_name,brand_color,logo_url").eq("owner_id",user.id).maybeSingle();
 if(error)return jsonError("Agency settings unavailable. Apply the agency settings migration.",503);
 const {data:billing}=await admin().from("billing_profiles").select("plan").eq("user_id",user.id).maybeSingle();return Response.json({agency_name:data?.agency_name||"",brand_color:data?.brand_color||"#4f46e5",logo_url:data?.logo_url||null,email:user.email,plan:billing?.plan||"starter"},{headers:{"Cache-Control":"no-store"}});
}
export async function PUT(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 let body:unknown;try{body=await request.json();}catch{return jsonError("Invalid JSON.",400);}
 if(!body||typeof body!=="object")return jsonError("Invalid settings.",400);
 const input=body as Record<string,unknown>;
 const agency_name=typeof input.agency_name==="string"?input.agency_name.trim():"";
 const brand_color=typeof input.brand_color==="string"?input.brand_color:"#4f46e5";
 if(!agency_name||agency_name.length>100||!/^#[0-9a-fA-F]{6}$/.test(brand_color))return jsonError("Enter a valid agency name and hex color.",400);
 const {data:billing,error:billingError}=await admin().from("billing_profiles").select("plan").eq("user_id",user.id).maybeSingle();
 if(billingError)return jsonError("Billing settings unavailable. Apply the billing migration.",503);
 const paid=billing?.plan==="pro"||billing?.plan==="agency";
 if(!paid&&brand_color.toLowerCase()!=="#4f46e5")return jsonError("Custom brand colors require Pro or Agency.",403);
 const {error}=await admin().from("agency_settings").upsert({owner_id:user.id,agency_name,brand_color,updated_at:new Date().toISOString()},{onConflict:"owner_id"});
 if(error)return jsonError("Could not save settings. Apply the agency settings migration.",503);
 return Response.json({ok:true});
}
