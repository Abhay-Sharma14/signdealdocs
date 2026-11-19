import {admin,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
export async function POST(request:Request){
 if(Number(request.headers.get("content-length")||0)>10000)return jsonError("Feedback too long.",413);
 let data:unknown;try{data=await request.json();}catch{return jsonError("Invalid feedback.",400);}
 const body=data as {type?:unknown;message?:unknown}|null;
 const type=body?.type,message=body?.message;
 if((type!=="feature"&&type!=="bug")||typeof message!=="string"||message.trim().length<10||message.trim().length>3000)return jsonError("Choose a feedback type and enter 10–3000 characters.",400);
 const auth=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
 let userId:string|null=null;
 if(auth){const {data:user,error}=await admin().auth.getUser(auth);if(error||!user.user)return jsonError("Invalid session.",401);userId=user.user.id;}
 const {error}=await admin().from("feedback").insert({user_id:userId,type,message:message.trim()});
 if(error){console.error("Feedback insert failed",error);return jsonError("Could not save feedback. Check database migration.",500);}
 return Response.json({ok:true},{status:201});
}
