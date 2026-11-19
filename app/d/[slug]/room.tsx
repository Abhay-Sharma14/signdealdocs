"use client";
import {useEffect,useState} from "react";
import {Portal as LegacyPortal} from "./legacy-portal";
import {SignContractModal} from "@/components/sign-contract-modal";

type Item={id:string;type:"proposal"|"contract"|"invoice"|"file_request";title:string;pdf_url:string|null;signed_pdf_url:string|null;status:string};
type Deal={client_name:string;project_title:string;amount:number;currency:string;status:string;brand_name:string;brand_color:string;logo_url:string|null;valid_until:string|null;payment_method?:string;upi_qr_url?:string|null;payment_notified_at?:string|null};
type Event={id:string;action:string;created_at:string};

export function AgencyDealRoom({token}:{token:string}){
 const [deal,setDeal]=useState<Deal|null>(null);
 const [items,setItems]=useState<Item[]>([]);
 const [events,setEvents]=useState<Event[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [active,setActive]=useState<Item|null>(null);
 const [busy,setBusy]=useState("");
 const [notifying,setNotifying]=useState(false);
 const [uploadSuccess,setUploadSuccess]=useState("");
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
 async function notifyAgency(){setNotifying(true);setError("");try{const r=await fetch(`/api/deal-rooms/${encodeURIComponent(token)}/payment-notification`,{method:"POST"});const p=await r.json();if(!r.ok)throw Error(p.error||"Could not notify agency.");await load();if(p.emailSent===false)setError("Payment notification recorded, but the email could not be delivered. The agency can still see your notification in their dashboard.");}catch(e){setError(e instanceof Error?e.message:"Notification failed.");}finally{setNotifying(false);}}
 async function upload(item:Item,file?:File){
  if(!file)return;setBusy(item.id);setError("");setUploadSuccess("");
  try{
   const f=new FormData();f.set("file",file);
   const r=await fetch(`/api/deal-rooms/${encodeURIComponent(token)}/items/${item.id}/upload`,{method:"POST",body:f});
   const p=await r.json();if(!r.ok)throw Error(p.error||"Upload failed.");await load();setUploadSuccess(p.emailSent===false?"File uploaded successfully. The agency can view it in their dashboard, but the notification email could not be sent.":"File uploaded successfully. The agency has been notified.");
  }catch(e){setError(e instanceof Error?e.message:"Upload failed.");}finally{setBusy("");}
 }
 if(loading)return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] p-6 text-sm text-slate-500">Opening your secure client portal…</main>;
 if(!deal)return <main className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-bold">Deal room unavailable</h1><p className="mt-3 text-slate-600">{error||"Ask the agency for a new link."}</p></main>;
 if(items.length===0)return <LegacyPortal slug={token}/>;
 const brand=deal.brand_name&&deal.brand_name!=="Your Agency"?deal.brand_name:"Apex Studio";
 const color=/^#[0-9a-fA-F]{6}$/.test(deal.brand_color)?deal.brand_color:"#4f46e5";
 const proposal=items.find(i=>i.type==="proposal");
 const contract=items.find(i=>i.type==="contract");
 
 const uploads=items.filter(i=>i.type==="file_request");
 const signed=contract?.status==="signed";
 const filesUploaded=uploads.length>0&&uploads.every(item=>item.status==="uploaded");
 const projectConfirmed=Boolean(signed&&deal.status==="paid"&&filesUploaded);
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
   {projectConfirmed&&<div role="status" className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-7 text-center shadow-sm"><p className="text-2xl font-extrabold text-emerald-800">🎉 Project Confirmed! You&apos;re all set.</p><p className="mt-2 text-sm text-emerald-700">Your contract is signed, payment is confirmed, and requested files have been uploaded.</p></div>}
   <div className="pb-2 text-center"><p className="mb-3 text-xs font-bold uppercase tracking-[.18em]" style={{color}}>Your project workspace</p><h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Project Proposal for <span style={{color}}>{deal.client_name}</span></h1><p className="mt-4 text-sm text-slate-500 sm:text-base">Prepared by {brand} <span className="px-1">·</span> Valid until {expiry}</p></div>
   {error&&<p role="status" className="rounded-xl border border-indigo-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm">{error}</p>}
   <section aria-labelledby="proposal-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-6 flex items-start justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Step 01 · Review</p><h2 id="proposal-title" className="text-xl font-extrabold">1. The Proposal</h2></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Document</span></div>
    <div className="rounded-xl border border-slate-200 bg-[#f8f9fc] p-5 sm:p-8"><div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-[0_10px_35px_rgba(15,23,42,0.10)] sm:px-10 sm:py-10"><div className="mb-7 h-1 w-16 rounded-full" style={{backgroundColor:color}}/><p className="text-[11px] font-bold uppercase tracking-[.15em] text-slate-400">Project proposal</p><h3 className="mt-3 break-words text-lg font-extrabold sm:text-xl">{deal.client_name} Proposal.pdf</h3><p className="mt-2 text-xs text-slate-500">{deal.project_title||"Project Proposal"} · Prepared by {brand}</p><div className="mt-8 space-y-2.5"><div className="h-2 w-full rounded bg-slate-100"/><div className="h-2 w-11/12 rounded bg-slate-100"/><div className="h-2 w-4/5 rounded bg-slate-100"/><div className="mt-5 h-2 w-3/5 rounded bg-slate-100"/></div></div></div>
    {proposal?.pdf_url?<a href={proposal.pdf_url} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-gray-100 px-5 py-3.5 text-sm font-bold text-gray-900 transition hover:border-slate-300 hover:bg-gray-200">Open Full Proposal ↗</a>:<p className="mt-4 text-sm text-rose-700">The proposal PDF is not available yet.</p>}
   </section>
   <section aria-labelledby="contract-title" className="rounded-2xl border-2 bg-white p-5 shadow-[0_12px_40px_rgba(79,70,229,0.07)] sm:p-8" style={{borderColor:color}}>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{color}}>Step 02 · Signature</p><h2 id="contract-title" className="text-xl font-extrabold">2. Service Agreement</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${signed?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{signed?"✓ Signed":"Signature required"}</span></div>
    <p className="mb-6 text-sm leading-7 text-slate-600">Please review and sign the contract to kick off the project.</p>
    {signed?(contract?.signed_pdf_url?<a href={contract.signed_pdf_url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">✓ Download Signed Contract ↗</a>:<p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">Contract signed. Your signed PDF is being prepared.</p>):<><button type="button" disabled={!contract?.pdf_url} onClick={()=>contract&&setActive(contract)} className="w-full rounded-xl px-5 py-4 text-sm font-extrabold text-white shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50" style={{backgroundColor:color}}>Review & Sign Contract →</button>{contract?.pdf_url&&<a href={contract.pdf_url} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center text-xs font-semibold text-slate-500 underline underline-offset-4">Preview agreement before signing</a>}</>}
   </section>
   <section aria-labelledby="payment-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Step 03 · Payment</p><h2 id="payment-title" className="text-xl font-extrabold">3. Initial Deposit</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${signed?"bg-indigo-50 text-indigo-700":"bg-slate-100 text-slate-500"}`}>{deal.status==="paid"?"✓ Paid":signed?(deal.payment_method==="manual_upi"?"Awaiting UPI payment":"Awaiting checkout"):"🔒 Locked"}</span></div>
    <p className="mb-5 text-sm leading-7 text-slate-600">A 50% deposit (<strong className="text-slate-900">{money(deposit)}</strong>) is required to secure your spot.</p>
    {deal.status==="paid"?<p className="rounded-xl bg-emerald-50 p-4 text-center font-bold text-emerald-700">✓ Payment confirmed by agency</p>:deal.payment_notified_at&&deal.payment_method==="manual_upi"?<div role="status" className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-6 py-10 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-700" aria-hidden="true">✓</div><h3 className="mt-5 text-2xl font-extrabold text-emerald-800">Payment Notified Successfully!</h3><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">The agency has been notified. They will verify your payment and update the status shortly. You can safely close this window.</p><p className="mt-3 text-xs text-slate-500">Your payment is not confirmed until the agency verifies it.</p></div>:!signed?<p className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-500">🔒 Payment unlocks after signing</p>:deal.payment_method==="manual_upi"?<div className="text-center">{deal.upi_qr_url?<><img src={deal.upi_qr_url} alt={`UPI payment QR code for ${brand}`} className="mx-auto h-64 w-64 rounded-xl border border-slate-200 bg-white object-contain p-3"/><p className="mx-auto mt-4 max-w-md text-sm font-semibold text-slate-800">Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to pay {money(deposit)}.</p><p className="mt-2 text-xs text-slate-500">Verify the recipient name and amount in your UPI app before paying.</p><button type="button" disabled={notifying||Boolean(deal.payment_notified_at)} onClick={()=>void notifyAgency()} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{deal.payment_notified_at?"Agency notified":notifying?"Notifying…":"I have paid — Notify Agency"}</button><p className="mt-2 text-xs text-slate-500">Once paid, please click here to notify the agency. Payment is confirmed only after the agency verifies receipt.</p></>:<p className="text-sm text-rose-700">UPI QR code unavailable. Please contact the agency.</p>}</div>:<><button type="button" disabled className="w-full cursor-not-allowed rounded-xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white opacity-60">Pay {money(deposit)} via Credit Card</button><p className="mt-3 text-center text-xs text-slate-500">Agency checkout setup is required before card payments can be accepted.</p></>}
   </section>
   {uploadSuccess&&<p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">✓ {uploadSuccess}</p>}
   {uploads.map(item=><section key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Step 04 · Onboarding</p><h2 className="text-lg font-bold">{item.title}</h2><p className="mt-2 text-sm text-slate-500">Upload PDF, PNG, JPG or WebP (up to 8 MB).</p><label className="mt-5 block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm font-bold text-slate-600 hover:bg-slate-100">{busy===item.id?"Uploading…":item.status==="uploaded"?"✓ Uploaded · Add another file":"Choose a file to upload"}<input type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg,.webp" disabled={Boolean(busy)} onChange={e=>{void upload(item,e.target.files?.[0]);e.target.value="";}}/></label></section>)}
   {events.length>0&&<section className="rounded-xl border border-slate-200 bg-white px-6 py-5"><h2 className="text-sm font-bold text-slate-700">Recent activity</h2><div className="mt-3 space-y-2">{events.slice(0,4).map(e=><p key={e.id} className="flex items-center gap-2 text-xs text-slate-500"><span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${e.action==="signed"?"bg-emerald-500":"bg-slate-400"}`}/>{new Date(e.created_at).toLocaleString()} · {e.action}</p>)}</div></section>}
  </main>
  <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-400">Powered securely by <a href="https://www.signdealdocs.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-500 underline-offset-2 hover:underline">SignDealDocs</a></footer>
  {active&&<SignContractModal pdfUrl={active.pdf_url} brandColor={color} onClose={()=>setActive(null)} onSign={sign}/>}
 </div>;
}
