import {admin,publicDeal,urlFor,jsonError} from "@/lib/deal-room";
export const runtime="nodejs";
type C={params:Promise<{shareToken:string}>};
export async function GET(_request:Request,{params}:C){
 const {shareToken}=await params;const deal=await publicDeal(shareToken);
 if(!deal)return jsonError("Deal link unavailable or expired.",404);
 const [{data:items,error},{data:events}]=await Promise.all([
  admin().from("deal_items").select("id,type,title,pdf_url,signed_pdf_url,status,sort_order").eq("deal_id",deal.id).order("sort_order"),
  admin().from("audit_log").select("id,action,created_at").eq("deal_id",deal.id).order("created_at",{ascending:false}).limit(15)
 ]);
 if(error)return jsonError("Could not load deal items. Apply migration.",500);
 const qrUrl=deal.payment_method==="manual_upi"?await urlFor(deal.upi_qr_path):null;
 const mapped=await Promise.all((items||[]).map(async item=>({...item,pdf_url:await urlFor(item.pdf_url),signed_pdf_url:await urlFor(item.signed_pdf_url)})));
 return Response.json({deal:{client_name:deal.client_name,project_title:deal.project_title,amount:deal.amount,currency:deal.currency,payment_method:deal.payment_method||"auto",upi_qr_url:qrUrl,payment_notified_at:deal.payment_notified_at,status:deal.status,brand_name:deal.brand_name||"Your Agency",brand_color:/^#[a-f0-9]{6}$/i.test(deal.brand_color||"")?deal.brand_color:"#4f46e5",logo_url:deal.logo_url,valid_until:deal.link_expires_at??null},items:mapped,events:events||[]},{headers:{"Cache-Control":"no-store, private","Referrer-Policy":"no-referrer"}});
}
