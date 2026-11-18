"use client";
import {useEffect,useState} from "react";
import {Portal as LegacyPortal} from "./legacy-portal";
import {SignatureCapture} from "@/components/signature-capture";

type Item={id:string;type:"proposal"|"contract"|"invoice"|"file_request";title:string;pdf_url:string|null;signed_pdf_url:string|null;status:string};
type Deal={client_name:string;project_title:string;amount:number;currency:string;status:string;brand_name:string;brand_color:string;logo_url:string|null;valid_until:string|null};
type Event={id:string;action:string;created_at:string};

export function AgencyDealRoom({token}:{token:string}){
 const [deal,setDeal]=useState<Deal|null>(null);
 const [items,setItems]=useState<Item[]>([]);
 const [events,setEvents]=useState<Event[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [active,setActive]=useState<Item|null>(null);
 const [busy,setBusy]=useState("");
 async function load(){
  const r=await fetch(`/api/deal-rooms/${encodeURIComponent(token)}`,{cache:"no-store"});
  const p=await r.json();
  if(!r.ok)throw Error(p.error||"Deal unavailable.");
  setDeal(p.deal);setItems(p.items);setEvents(p.events);
 }
 useEffect(()=>{let mounted=true;void (async()=>{try{await load();}catch(e){if(mounted)setError(e instanceof Error?e.message:"Deal unavailable.");}finally{if(mounted)setLoading(false);}})();return()=>{mounted=false;};},[token]);
 async function sign(png:string){
  if(!active)return;
  const r=await fetch(`/api/deal-rooms/${encodeURIComponent(token)}/items/${active.id}/sign`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({signatureImage:png,consent:true})});
  const p=await r.json();if(!r.ok)throw Error(p.error||"Signing failed.");
  setActive(null);await load();setError("Contract Signed! Your deposit step is now available for review.");
 }
 async function upload(item:Item,file?:File){
  if(!file)return;setBusy(item.id);setError("");
  try{
   const f=new FormData();f.set("file",file);
   const r=await fetch(`/api/deal-rooms/${encodeURIComponent(token)}/items/${item.id}/upload`,{method:"POST",body:f});
   const p=await r.json();if(!r.ok)throw Error(p.error||"Upload failed.");await load();
  }catch(e){setError(e instanceof Error?e.message:"Upload failed.");}finally{setBusy("");}
 }
 if(loading)return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] p-6 text-sm text-slate-500">Opening your secure client portal…</main>;
 if(!deal)return <main className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-bold">Deal room unavailable</h1><p className="mt-3 text-slate-600">{error||"Ask the agency for a new link."}</p></main>;
 if(items.length===0)return <LegacyPortal slug={token}/>;
 const brand=deal.brand_name&&deal.brand_name!=="Your Agency"?deal.brand_name:"Apex Studio";
 const color=/^#[0-9a-fA-F]{6}$/.test(deal.brand_color)?deal.brand_color:"#4f46e5";
 const proposal=items.find(i=>i.type==="proposal");
 const contract=items.find(i=>i.type==="contract");
 const invoice=items.find(i=>i.type==="invoice");
 const uploads=items.filter(i=>i.type==="file_request");
 const signed=contract?.status==="signed";
 const deposit=Number(deal.amount||0)*0.5;
 const money=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:deal.currency||"USD",maximumFractionDigits:2}).format(value);
 const expiry=deal.valid_until?new Date(deal.valid_until).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Date to be confirmed";
 return <div className="flex min-h-screen flex-col bg-[#f7f8fc] text-slate-900">
  <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur">
   <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
    <div className="flex min-w-0 items-center gap-3">
     {deal.logo_url?<img src={deal.logo_url} alt={`${brand} logo`} className="h-11 w-11 rounded-xl border border-slate-100 object-contain p-1"/>:<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold text-white shadow-sm" style={{backgroundColor:color}}>{brand.slice(0,1).toUpperCase()}</div>}
     <div className="min-w-0"><p className="truncate text-base font-extrabold tracking-tight sm:text-lg">{brand}</p><p className="hidden text-xs text-slate-500 sm:block">Agency client experience</p></div>
    </div>
    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-2 text-[10px] font-semibold text-slate-600 sm:px-4 sm:text-xs">🔒 Secure Client Portal</span>
   </div>
  </header>
  <main className="mx-auto w-full max-w-[800px] flex-1 space-y-6 px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
   <div className="pb-2 text-center"><p className="mb-3 text-xs font-bold uppercase tracking-[.18em]" style={{color}}>Your project workspace</p><h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Project Proposal for <span style={{color}}>{deal.client_name}</span></h1><p className="mt-4 text-sm text-slate-500 sm:text-base">Prepared by {brand} <span className="px-1">·</span> Valid until {expiry}</p></div>
   {error&&<p role="status" className="rounded-xl border border-indigo-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm">{error}</p>}
   <section aria-labelledby="proposal-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-6 flex items-start justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Step 01 · Review</p><h2 id="proposal-title" className="text-xl font-extrabold">1. The Proposal</h2></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Document</span></div>
    <div className="rounded-xl border border-slate-200 bg-[#f8f9fc] p-5 sm:p-8"><div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-[0_10px_35px_rgba(15,23,42,0.10)] sm:px-10 sm:py-10"><div className="mb-7 h-1 w-16 rounded-full" style={{backgroundColor:color}}/><p className="text-[11px] font-bold uppercase tracking-[.15em] text-slate-400">Project proposal</p><h3 className="mt-3 break-words text-lg font-extrabold sm:text-xl">{deal.client_name} Proposal.pdf</h3><p className="mt-2 text-xs text-slate-500">{deal.project_title||"Project Proposal"} · Prepared by {brand}</p><div className="mt-8 space-y-2.5"><div className="h-2 w-full rounded bg-slate-100"/><div className="h-2 w-11/12 rounded bg-slate-100"/><div className="h-2 w-4/5 rounded bg-slate-100"/><div className="mt-5 h-2 w-3/5 rounded bg-slate-100"/></div></div></div>
    {proposal?.pdf_url?<a href={proposal.pdf_url} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-bold transition hover:border-slate-300 hover:bg-slate-50" style={{color}}>Open Full Proposal ↗</a>:<p className="mt-4 text-sm text-rose-700">The proposal PDF is not available yet.</p>}
   </section>
   <section aria-labelledby="contract-title" className="rounded-2xl border-2 bg-white p-5 shadow-[0_12px_40px_rgba(79,70,229,0.07)] sm:p-8" style={{borderColor:color}}>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{color}}>Step 02 · Signature</p><h2 id="contract-title" className="text-xl font-extrabold">2. Service Agreement</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${signed?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{signed?"✓ Signed":"Signature required"}</span></div>
    <p className="mb-6 text-sm leading-7 text-slate-600">Please review and sign the contract to kick off the project.</p>
    {signed?(contract?.signed_pdf_url?<a href={contract.signed_pdf_url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">✓ Download Signed Contract ↗</a>:<p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">Contract signed. Your signed PDF is being prepared.</p>):<><button type="button" disabled={!contract?.pdf_url} onClick={()=>contract&&setActive(contract)} className="w-full rounded-xl px-5 py-4 text-sm font-extrabold text-white shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50" style={{backgroundColor:color}}>Review & Sign Contract →</button>{contract?.pdf_url&&<a href={contract.pdf_url} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center text-xs font-semibold text-slate-500 underline underline-offset-4">Preview agreement before signing</a>}</>}
   </section>
   <section aria-labelledby="payment-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Step 03 · Payment</p><h2 id="payment-title" className="text-xl font-extrabold">3. Initial Deposit</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${signed?"bg-indigo-50 text-indigo-700":"bg-slate-100 text-slate-500"}`}>{signed?"Awaiting checkout":"🔒 Locked"}</span></div>
    <p className="mb-5 text-sm leading-7 text-slate-600">A 50% deposit (<strong className="text-slate-900">{money(deposit)}</strong>) is required to secure your spot.</p>
    <button type="button" disabled aria-disabled="true" className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-5 py-4 text-sm font-bold text-slate-400">{signed?`Pay ${money(deposit)} via Credit Card · Coming soon`:"🔒 Unlocks after signing"}</button>
    {signed&&<p className="mt-3 text-center text-xs text-slate-500">Credit card checkout is not connected yet. No payment will be collected.</p>}
   </section>
   {uploads.map(item=><section key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><h2 className="text-lg font-bold">{item.title}</h2><p className="mt-2 text-sm text-slate-500">Upload PDF, PNG, JPG or WebP (up to 8 MB).</p><label className="mt-5 block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm font-bold text-slate-600 hover:bg-slate-100">{busy===item.id?"Uploading…":item.status==="uploaded"?"✓ Uploaded · Add another file":"Choose a file to upload"}<input type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg,.webp" disabled={Boolean(busy)} onChange={e=>{void upload(item,e.target.files?.[0]);e.target.value="";}}/></label></section>)}
   {events.length>0&&<section className="rounded-xl border border-slate-200 bg-white px-6 py-5"><h2 className="text-sm font-bold text-slate-700">Recent activity</h2><div className="mt-3 space-y-2">{events.slice(0,4).map(e=><p key={e.id} className="text-xs text-slate-500">{new Date(e.created_at).toLocaleString()} · {e.action}</p>)}</div></section>}
  </main>
  <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-400">Powered securely by <a href="https://www.signdealdocs.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-500 underline-offset-2 hover:underline">SignDealDocs</a></footer>
  {active&&<div role="dialog" aria-modal="true" aria-label="Sign contract" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"><div className="mx-auto my-3 max-w-5xl space-y-6 rounded-2xl bg-white p-5 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider" style={{color}}>Secure e-signature</p><h2 className="mt-1 text-2xl font-extrabold">Review & Sign Contract</h2></div><button type="button" onClick={()=>setActive(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close ✕</button></div><p className="text-sm text-slate-600">Please read the complete agreement before signing. Your electronic signature will be embedded in the PDF; it is not a certificate-based digital signature.</p>{active.pdf_url&&<iframe title="Contract PDF" src={active.pdf_url} className="h-[42vh] min-h-64 w-full rounded-xl border bg-slate-50"/>}<SignatureCapture onSign={sign}/></div></div>}
 </div>;
}
