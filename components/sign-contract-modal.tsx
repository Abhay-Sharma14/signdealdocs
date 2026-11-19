"use client";
import {useEffect,useRef,useState} from "react";
import {SignatureCapture} from "@/components/signature-capture";
type Props={pdfUrl:string|null;brandColor:string;onClose:()=>void;onSign:(png:string)=>Promise<void>};
export function SignContractModal({pdfUrl,brandColor,onClose,onSign}:Props){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const closeRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  closeRef.current?.focus();
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const key=(e:KeyboardEvent)=>{if(e.key==="Escape"&&!busy)onClose();};
  document.addEventListener("keydown",key);
  return()=>{document.body.style.overflow=previous;document.removeEventListener("keydown",key);};
 },[busy,onClose]);
 async function submit(png:string){
  setError("");setBusy(true);
  try{await onSign(png);}catch(e){const message=e instanceof Error?e.message:"Could not sign the agreement.";setError(message);throw e;}finally{setBusy(false);}
 }
 return <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-md sm:p-6" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}>
  <div role="dialog" aria-modal="true" aria-labelledby="signature-modal-title" className="my-auto flex max-h-[96dvh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_90px_rgba(0,0,0,0.25)]">
   <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Electronic signature</p><h2 id="signature-modal-title" className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Review & Sign Contract</h2></div><button ref={closeRef} type="button" onClick={onClose} disabled={busy} aria-label="Close signature modal" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xl text-slate-500 hover:bg-slate-50 disabled:opacity-40">×</button></header>
   <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
    <div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-800">Review your agreement</h3>{pdfUrl&&<a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">Open PDF in new tab ↗</a>}</div>{pdfUrl?<iframe title="Service agreement PDF preview" src={pdfUrl} className="h-44 w-full rounded-xl border border-slate-200 bg-slate-50 sm:h-52"/>:<div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">Contract preview unavailable</div>}<p className="mt-2 text-xs leading-5 text-slate-500">Please review the full contract before signing. A visible electronic signature will be embedded into the PDF; this is not a certificate-based digital signature.</p></div>
    <div className="border-t border-slate-100 pt-5"><h3 className="mb-3 text-sm font-bold text-slate-800">Your signature</h3><SignatureCapture onSign={submit} disabled={busy} brandColor={brandColor} onCancel={onClose}/></div>
    {error&&<p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
   </div>
   {busy&&<div role="status" aria-live="polite" className="flex items-center justify-center gap-3 border-t bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700"><span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-700"/>Flattening PDF…</div>}
  </div>
 </div>;
}
