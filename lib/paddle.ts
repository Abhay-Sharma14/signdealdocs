import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
export function paddlePrice(plan:"pro"|"agency"){return plan==="pro"?process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID:process.env.NEXT_PUBLIC_PADDLE_AGENCY_PRICE_ID;}
export function checkoutProof(userId:string,plan:string,expiry:number){
 const secret=process.env.PADDLE_API_KEY;
 if(!secret)throw Error("Paddle API key not configured.");
 return createHmac("sha256",secret).update(`${userId}:${plan}:${expiry}`).digest("hex");
}
export function validProof(userId:string,plan:string,expiry:unknown,proof:unknown){
 if(typeof expiry!=="number"||expiry<Date.now()||expiry>Date.now()+3600000||typeof proof!=="string"||!/^[a-f0-9]{64}$/i.test(proof))return false;
 const expected=checkoutProof(userId,plan,expiry);
 return timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(proof,"hex"));
}
export function verifyPaddle(body:string,header:string|null){
 const secret=process.env.PADDLE_WEBHOOK_SECRET;
 if(!secret||!header)return false;
 const parts=header.split(";").map(p=>p.trim());
 const ts=parts.find(p=>p.startsWith("ts="))?.slice(3);
 const hashes=parts.filter(p=>p.startsWith("h1=")).map(p=>p.slice(3));
 if(!ts||!/^\d+$/.test(ts)||Math.abs(Date.now()/1000-Number(ts))>300)return false;
 const expected=createHmac("sha256",secret).update(`${ts}:${body}`).digest("hex");
 return hashes.some(hash=>/^[0-9a-f]{64}$/i.test(hash)&&timingSafeEqual(Buffer.from(hash,"hex"),Buffer.from(expected,"hex")));
}
