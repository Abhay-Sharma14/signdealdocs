import {owner,jsonError} from "@/lib/deal-room";

export const runtime="nodejs";

export async function POST(request:Request){
 try{
  const user=await owner(request);
  if(!user)return jsonError("Sign in required.",401);

  let body:unknown;
  try{body=await request.json();}catch{return jsonError("Invalid JSON.",400);}
  const plan=(body as {productId?:unknown})?.productId;
  const currency=(body as {currency?:unknown})?.currency??"USD";
  if(currency!=="USD"&&currency!=="INR")return jsonError("Unsupported billing currency.",400);
  if(plan!=="pro"&&plan!=="agency")return jsonError("Invalid productId.",400);

  const productId=currency==="INR"?(plan==="pro"?process.env.DODO_PRO_INR_PRODUCT_ID:process.env.DODO_AGENCY_INR_PRODUCT_ID):(plan==="pro"?process.env.DODO_PRO_PRODUCT_ID:process.env.DODO_AGENCY_PRODUCT_ID);
  if(currency==="INR"&&!productId)return jsonError("INR checkout is not available yet. Select United States (USD) or contact support.",503);
  const apiKey=process.env.DODO_PAYMENTS_API_KEY;
  if(!productId||!apiKey){
   console.error("Checkout configuration missing",{
    hasApiKey:Boolean(apiKey),hasProductId:Boolean(productId),plan
   });
   return jsonError("Payment checkout is not configured. Please contact support.",503);
  }
  const environment=process.env.DODO_PAYMENTS_ENVIRONMENT||"test_mode";
  if(environment!=="test_mode"&&environment!=="live_mode"){
   console.error("Invalid DODO_PAYMENTS_ENVIRONMENT");
   return jsonError("Payment checkout configuration is invalid.",503);
  }

  // Call the official Checkout Sessions REST API directly. The adapter can
  // return a non-JSON response, hiding the actual payment-provider failure.
  const endpoint=environment==="live_mode"
   ?"https://live.dodopayments.com/checkouts"
   :"https://test.dodopayments.com/checkouts";
  const payload={
   product_cart:[{product_id:productId,quantity:1}],
   metadata:{user_id:user.id,plan,currency},
   ...(user.email?{customer:{email:user.email}}:{}),
   ...(process.env.DODO_PAYMENTS_RETURN_URL?{return_url:process.env.DODO_PAYMENTS_RETURN_URL}:{})
  };
  const response=await fetch(endpoint,{
   method:"POST",
   headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},
   body:JSON.stringify(payload),
   cache:"no-store",
   signal:AbortSignal.timeout(15000)
  });
  const raw=await response.text();
  let result:Record<string,unknown>|null=null;
  try{
   const parsed:unknown=JSON.parse(raw);
   if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))result=parsed as Record<string,unknown>;
  }catch{ /* Preserve provider HTTP status when response is not JSON. */ }

  if(!response.ok){
   console.error("Dodo checkout API error",{
    status:response.status,environment,plan,
    providerCode:result?.code??result?.type??null,
    providerMessage:result?.message??result?.error??raw.slice(0,300)
   });
   if(response.status===401||response.status===403)
    return jsonError("Payment provider authentication failed. Please contact support.",502);
   if(response.status===404||response.status===422||response.status===400)
    return jsonError("Payment plan configuration was rejected. Please contact support.",502);
   return jsonError("Payment provider is temporarily unavailable. Please try again later.",502);
  }
  const url=result?.checkout_url;
  if(typeof url!=="string"||!url.startsWith("https://")){
   console.error("Dodo checkout API returned no checkout_url",response.status,raw.slice(0,300));
   return jsonError("Payment provider did not return a checkout link.",502);
  }
  return Response.json({checkout_url:url},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("Checkout session creation failed",error);
  return jsonError("Could not create checkout session. Please try again later.",502);
 }
}
