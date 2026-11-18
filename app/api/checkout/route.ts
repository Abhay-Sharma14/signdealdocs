import {Checkout} from "@dodopayments/nextjs";
import {owner,jsonError} from "@/lib/deal-room";

export const runtime="nodejs";

export async function POST(request:Request){
 try{
  const user=await owner(request);
  if(!user)return jsonError("Sign in required.",401);

  let body:unknown;
  try{body=await request.json();}catch{return jsonError("Invalid JSON.",400);}
  const plan=(body as {productId?:unknown})?.productId;
  if(plan!=="pro"&&plan!=="agency")return jsonError("Invalid productId.",400);

  const productId=plan==="pro"?process.env.DODO_PRO_PRODUCT_ID:process.env.DODO_AGENCY_PRODUCT_ID;
  const apiKey=process.env.DODO_PAYMENTS_API_KEY;
  if(!productId||!apiKey)return jsonError("Payment checkout is temporarily unavailable. Please try again later.",503);

  // Initialize only after configuration validation, so missing secrets cannot
  // throw during module import and cause a non-JSON Next.js error response.
  const handler=Checkout({
   bearerToken:apiKey,
   returnUrl:process.env.DODO_PAYMENTS_RETURN_URL,
   environment:(process.env.DODO_PAYMENTS_ENVIRONMENT||"test_mode") as "test_mode"|"live_mode",
   type:"session"
  });
  const payload={
   product_cart:[{product_id:productId,quantity:1}],
   metadata:{user_id:user.id,plan},
   customer:user.email?{email:user.email}:undefined
  };
  const delegated=new Request(request.url,{
   method:"POST",
   headers:{"content-type":"application/json"},
   body:JSON.stringify(payload)
  });
  const response=await handler(delegated as never);
  const raw=await response.text();
  let result:unknown;
  try{result=JSON.parse(raw);}catch{
   console.error("Dodo checkout returned non-JSON response",response.status,raw.slice(0,500));
   return jsonError("Payment provider returned an unexpected response. Please try again later.",502);
  }
  if(!response.ok){
   console.error("Dodo checkout failed",response.status,JSON.stringify(result).slice(0,500));
   return jsonError("Unable to start checkout. Please try again later.",response.status>=400&&response.status<600?response.status:502);
  }
  const data=result as {checkout_url?:unknown;url?:unknown};
  const url=data.checkout_url||data.url;
  if(typeof url!=="string"||!url.startsWith("https://")){
   console.error("Dodo checkout returned no valid checkout URL",JSON.stringify(result).slice(0,500));
   return jsonError("Payment provider did not return a checkout link.",502);
  }
  return Response.json({checkout_url:url});
 }catch(error){
  console.error("Checkout session creation failed",error);
  return jsonError("Could not create checkout session. Please try again later.",502);
 }
}
