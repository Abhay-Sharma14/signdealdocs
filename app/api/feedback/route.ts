import {admin,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
export async function POST(request:Request){
 if(Number(request.headers.get("content-length")||0)>10000)return jsonError("Feedback too long.",413);
 let data:unknown;try{data=await request.json();}catch{return jsonError("Invalid JSON.",400);}
 if(!data||typeof data!=="object"||Array.isArray(data))return jsonError("Invalid feedback.",400);
 const body=data as Record<string,unknown>;
 if(body.type!=="feature"&&body.type!=="bug")return jsonError("Invalid feedback type.",400);
 if(typeof body.message!=="string"||body.message.trim().length<10||body.message.trim().length>3000)return jsonError("Enter 10–3000 characters.",400);
 if(body.email!==undefined&&typeof body.email!=="string")return jsonError("Invalid email.",400);
 let email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
 if(email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254))return jsonError("Invalid email.",400);
 const jwt=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(jwt){const {data:user,error}=await admin().auth.getUser(jwt);if(error||!user.user)return jsonError("Invalid session.",401);email=user.user.email||email;}
 const {error}=await admin().from("feedback").insert({email:email||null,type:body.type,message:body.message.trim()});
 if(error){
  console.error("Feedback storage failed",{code:error.code,message:error.message,details:error.details});
  if(error.code==="42P01"||error.code==="PGRST205"||error.code==="PGRST204"||error.code==="42703"){
   return jsonError("Feedback storage is not set up yet. The site administrator needs to apply the feedback database migration.",503);
  }
  if(error.code==="42501")return jsonError("Feedback storage permissions are not configured. Please contact support.",503);
  return jsonError("We couldn't save your feedback right now. Please try again later.",500);
 }
 return Response.json({ok:true},{status:201});
}
