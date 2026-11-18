import {Checkout} from "@dodopayments/nextjs";
import {owner,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
const handler=Checkout({bearerToken:process.env.DODO_PAYMENTS_API_KEY!,returnUrl:process.env.DODO_PAYMENTS_RETURN_URL,environment:(process.env.DODO_PAYMENTS_ENVIRONMENT||"test_mode") as "test_mode"|"live_mode",type:"session"});
export async function POST(request:Request){
 const user=await owner(request);if(!user)return jsonError("Sign in required.",401);
 let body:unknown;try{body=await request.json();}catch{return jsonError("Invalid JSON.",400);}
 const plan=(body as {productId?:unknown})?.productId;
 if(plan!=="pro"&&plan!=="agency")return jsonError("Invalid productId.",400);
 const productId=plan==="pro"?process.env.DODO_PRO_PRODUCT_ID:process.env.DODO_AGENCY_PRODUCT_ID;
 if(!productId||!process.env.DODO_PAYMENTS_API_KEY)return jsonError("Dodo checkout not configured.",503);
 const payload={product_cart:[{product_id:productId,quantity:1}],metadata:{user_id:user.id,plan},customer:user.email?{email:user.email}:undefined};
 const delegated=new Request(request.url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
 const response=await handler(delegated as never);
 return response;
}
