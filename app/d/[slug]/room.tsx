"use client";
import {useEffect,useState} from "react";
import {Portal as LegacyPortal} from "./legacy-portal";
import {SignatureCapture} from "@/components/signature-capture";
type Item={id:string;type:"proposal"|"contract"|"invoice"|"file_request";title:string;pdf_url:string|null;signed_pdf_url:string|null;status:string};
type Deal={client_name:string;project_title:string;amount:number;currency:string;status:string;brand_name:string;brand_color:string;logo_url:string|null};
type Event={id:string;action:string;created_at:string};
export function AgencyDealRoom({token}:{token:string}){
 const [deal,setDeal]=useState<Deal|null>(null),[items,setItems]=useState<Item[]>([]),[events,setEvents]=useState<Event[]>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[active,setActive]=useState<Item|null>(null),[busy,setBusy]=useState("");
 async function load(){
  const r=await fetch(`/api/deal-rooms/${encodeURIComponent(token)}`,{cache:"no-store"});
  const p=await r.json();if(!r.ok)throw Error(p.error||"Deal unavailable.");
  setDeal(p.deal);setItems(p.items);setEvents(p.events);
 }
 useEffect(()=>{let mounted=true;void (async()=>{try{await load();}catch(e){if(mounted)setError(e instanceof Error?e.message:"Deal unavailable.");}finally{if(mounted)setLoading(false);}})();return()=>{mounted=false;};},[token]);
 async function sign(png:string){
  if(!active)return;
  const r=await fetch(`/api/deal-rooms/${encodeURIComponent(token)}/items/${active.id}/sign`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({signatureImage:png,consent:true})});
  const p=await r.json();if(!r.ok)throw Error(p.error||"Signing failed.");
  setActive(null);await load();setError("Contract Signed! You can now review the deposit payment step.");
 }
 async function upload(item:Item,file?:File){
  if(!file)return;setBusy(item.id);setError("");
  try{const f=new FormData();f.set("file",file);const r=await fetch(`/api/deal-rooms/${encodeURIComponent(token)}/items/${item.id}/upload`,{method:"POST",body:f});const p=await r.json();if(!r.ok)throw Error(p.error||"Upload failed.");await load();}catch(e){setError(e instanceof Error?e.message:"Upload failed.");}finally{setBusy("");}
 }
 if(loading)return <main className="mx-auto max-w-xl p-12 text-center text-slate-600">Opening your secure client portal…</main>;
 if(!deal)return <main className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-bold">Deal room unavailable</h1><p className="mt-3 text-slate-600">{error||"Ask the agency for a new link."}</p></main>;
 if(items.length===0)return <LegacyPortal slug={token}/>;
 const signed=items.some(i=>i.type==="contract"&&i.status==="signed");
 const color=deal.brand_color;
 return <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
  <header className="border-b bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4"><div className="flex items-center gap-3">{deal.logo_url?<img src={deal.logo_url} alt="" className="h-9 w-9 object-contain"/>:<span className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{background:color}}>{deal.brand_name[0]}</span>}<strong className="text-base">{deal.brand_name}</strong></div><span className="rounded-full border px-3 py-1 text-xs text-slate-500">🔒 Secure Client Portal</span></div></header>
  <main className="mx-auto max-w-2xl space-y-5 px-4 py-9">
   <div className="text-center"><h1 className="text-2xl font-bold">Project Proposal for <span style={{color}}>{deal.client_name}</span></h1><p className="mt-2 text-sm text-slate-500">Prepared by {deal.brand_name}</p></div>
   <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-950 text-sm text-white shadow-md">▶ Personalized introduction video · Optional</div>
   {error&&<p role="status" className="rounded-xl border bg-white p-3 text-sm">{error}</p>}
   {items.map((item,index)=><section key={item.id} className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{index+1}. {item.title}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase">{item.status==="pending"&&item.type==="invoice"&&!signed?"Locked":item.status}</span></div>
    {item.type==="proposal"&&<><p className="text-sm text-slate-500">Review the proposal before signing.</p>{item.pdf_url?<a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border px-4 py-3 text-center text-sm font-semibold" style={{color}}>View Full Proposal</a>:<p className="text-sm text-rose-700">Proposal unavailable</p>}</>}
    {item.type==="contract"&&<><p className="text-sm text-slate-500">Review and electronically sign the service agreement.</p>{item.status==="signed"?<a href={item.signed_pdf_url||"#"} target="_blank" rel="noopener noreferrer" className="block rounded-lg border p-3 text-center text-sm font-semibold">Download Signed Contract</a>:<><a href={item.pdf_url||"#"} target="_blank" rel="noopener noreferrer" className="block text-center text-sm underline">Review Contract PDF</a><button type="button" disabled={!item.pdf_url} onClick={()=>setActive(item)} style={{background:color}} className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Review & Sign Contract</button></>}</>}
    {item.type==="invoice"&&<><p className="text-sm text-slate-500">{signed?"Contract signed. Payment collection will be available once checkout is connected.":"Sign the contract to unlock the payment step."}</p><button disabled className="w-full rounded-lg border px-4 py-3 text-sm font-semibold text-slate-400">{signed?`Pay ${deal.currency} ${deal.amount.toLocaleString()} · Checkout coming soon`:"Payment locked until signing"}</button></>}
    {item.type==="file_request"&&<><p className="text-sm text-slate-500">Upload the requested assets (PDF, PNG, JPG or WebP, up to 8 MB).</p><label className="block cursor-pointer rounded-xl border-2 border-dashed p-7 text-center text-sm font-semibold" style={{borderColor:color}}> {busy===item.id?"Uploading…":item.status==="uploaded"?"Uploaded · Add another file":"Click to upload files"}<input type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg,.webp" disabled={Boolean(busy)} onChange={e=>{void upload(item,e.target.files?.[0]);e.target.value="";}}/></label></>}
   </section>)}
   <footer className="border-t pt-5"><h2 className="mb-3 text-sm font-bold">Activity Log</h2>{events.length?events.map(e=><p key={e.id} className="py-1 text-xs text-slate-500">{new Date(e.created_at).toLocaleString()} · {e.action}</p>):<p className="text-xs text-slate-500">No activity yet.</p>}<p className="mt-6 text-center text-xs text-slate-400">Private deal room · Powered securely by SignDealDocs</p></footer>
  </main>
  {active&&<div role="dialog" aria-modal="true" aria-label="Sign contract" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4"><div className="mx-auto my-6 max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><h2 className="text-xl font-bold">Review & Sign Contract</h2><button onClick={()=>setActive(null)} className="text-sm text-slate-600">Close ✕</button></div><p className="text-sm text-slate-600">Review the entire agreement before signing. This embeds a visible electronic signature in the PDF, not a certificate-based digital signature.</p>{active.pdf_url&&<iframe title="Contract PDF" src={active.pdf_url} className="h-64 w-full rounded-lg border"/>}<SignatureCapture onSign={sign}/></div></div>}
 </div>;
}
