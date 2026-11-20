import {NextResponse} from "next/server";
import {getSupabaseAdmin} from "@/lib/supabase-admin";
export const runtime="nodejs";
const allowedTypes=["Service Agreement","Project Proposal","NDA (Non-Disclosure)","Statement of Work (SOW)","Retainer Contract"];
const allowedLaws=["India (Indian Contract Act)","United States (Delaware / General)","United Kingdom / EU"];
export async function POST(request:Request){
 const bearer=request.headers.get("authorization")?.match(/^Bearer\\s+(.+)$/i)?.[1];
 if(!bearer)return NextResponse.json({error:"Sign in required."},{status:401});
 const {data:{user}}=await getSupabaseAdmin().auth.getUser(bearer);
 if(!user)return NextResponse.json({error:"Session expired."},{status:401});
 if(Number(request.headers.get("content-length")||0)>16000)return NextResponse.json({error:"Request too large."},{status:413});
 let input:Record<string,unknown>;try{input=await request.json();}catch{return NextResponse.json({error:"Invalid request."},{status:400});}
 const type=String(input.type||""),law=String(input.law||""),scope=String(input.scope||"").trim(),title=String(input.title||"").slice(0,160),signer=String(input.signer||"").slice(0,120),refinement=String(input.refinement||"").slice(0,60),previous=String(input.previous||"").slice(0,14000);
 if(!allowedTypes.includes(type)||!allowedLaws.includes(law)||!scope||scope.length>6000||!title||!signer||!["","stricter","simplify","payment","regenerate"].includes(refinement))return NextResponse.json({error:"Provide valid document details and scope."},{status:400});
 const {data:withinQuota,error:quotaError}=await getSupabaseAdmin().rpc("consume_ai_proposal_quota",{p_user_id:user.id});
 if(quotaError)return NextResponse.json({error:"AI quota unavailable. Apply the existing AI quota migration."},{status:503});
 if(!withinQuota)return NextResponse.json({error:"AI generation limit reached. Try again later."},{status:429});
 const key=process.env.GEMINI_API_KEY;if(!key)return NextResponse.json({error:"AI service not configured."},{status:503});
 const {data:agency}=await getSupabaseAdmin().from("agency_settings").select("agency_name").eq("owner_id",user.id).maybeSingle();
 const agencyName=agency?.agency_name||"The Agency";
 const instruction=refinement==="stricter"?"Strengthen clearly drafted risk allocation and remedies without inventing terms.":refinement==="simplify"?"Use clear, plain language while preserving essential protections.":refinement==="payment"?"Add payment schedule, invoicing, late-payment and refund clauses only when supported by the scope; otherwise use editable placeholders.":"";
 const prompt=`Draft a professional, editable ${type} for an agency. Governing law preference: ${law}. Title: ${title}. Agency: ${agencyName}. Counterparty: ${signer}. Scope and commercial facts: ${scope}. Today: ${new Date().toISOString().slice(0,10)}. ${instruction} ${previous?"Revise this prior draft: "+previous:""}.
Return only plain text with numbered clause headings and paragraphs, separated by blank lines. Include parties, scope, deliverables, payment (only if known), timelines (only if known), confidentiality, intellectual property, termination, liability, dispute resolution, governing law, signature blocks. Never fabricate addresses, legal guarantees, pricing, dates or regulatory compliance. Use [TO BE CONFIRMED] where facts are missing. Do not claim legal advice or legal enforceability.`;
 try{
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.35,maxOutputTokens:5500}}),signal:AbortSignal.timeout(30000)});
  const result=await response.json();if(!response.ok)return NextResponse.json({error:"AI drafting temporarily unavailable."},{status:502});
  const draft=String(result?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("")||"").trim();
  if(!draft)return NextResponse.json({error:"AI returned no draft."},{status:502});
  return NextResponse.json({draft,agencyName},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"AI drafting timed out. Try again."},{status:504});}
}
