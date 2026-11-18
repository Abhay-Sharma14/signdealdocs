import {owner,jsonError} from "@/lib/deal-room";
import {checkoutProof,paddlePrice} from "@/lib/paddle";
export const runtime="nodejs";
export async function POST(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 let body:{plan?:string};try{body=await request.json();}catch{return jsonError("Invalid JSON.",400);}
 if(body.plan!=="pro"&&body.plan!=="agency")return jsonError("Invalid plan.",400);
 const priceId=paddlePrice(body.plan);
 if(!priceId||!/^pri_/.test(priceId)||!process.env.PADDLE_API_KEY)return jsonError("Paddle is not configured.",503);
 const expiry=Date.now()+15*60*1000;
 return Response.json({priceId,customData:{user_id:user.id,plan:body.plan,expiry,proof:checkoutProof(user.id,body.plan,expiry)}},{headers:{"Cache-Control":"no-store"}});
}
