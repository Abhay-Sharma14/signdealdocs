"use client";
import {useEffect,useRef,useState} from "react";
import {useParams} from "next/navigation";
import {Logo} from "@/components/logo";
import {SignaturePad,type SignaturePadHandle} from "@/components/signature-pad";
type RequestData={title:string;signer_name:string;original_name:string;pdf_url:string|null;signature_url:string|null;signed_at:string|null};
export default function SignPage(){
 const params=useParams<{token:string}>();
 const pad=useRef<SignaturePadHandle>(null);
 const [data,setData]=useState<RequestData|null>(null);
 const [name,setName]=useState("");
 const [consent,setConsent]=useState(false);
 const [signMode,setSignMode]=useState<"draw"|"upload">("draw");
 const [uploadedSignature,setUploadedSignature]=useState<File|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 useEffect(()=>{let cancelled=false;fetch(`/api/signatures/${encodeURIComponent(params.token)}`,{cache:"no-store"}).then(async r=>{const payload=await r.json();if(!r.ok)throw Error(payload.error);if(!cancelled)setData(payload);}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"Link unavailable.");}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[params.token]);
 async function sign(){
 let blob:Blob|null|undefined;
 if(signMode==="upload"){
  if(!uploadedSignature){setError("Choose a PNG or JPG signature image.");return;}
  if(uploadedSignature.size>250_000){setError("Signature image must be smaller than 250 KB.");return;}
  try {
   const bitmap=await createImageBitmap(uploadedSignature);
   const maxSide=900;
   const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement("canvas");
   canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const ctx=canvas.getContext("2d");
   if(!ctx)throw Error("Could not process the signature image.");
   ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   bitmap.close();
   blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/png"));
  }catch {setError("Please upload a valid PNG or JPG image.");return;}
 }else{
  blob=await pad.current?.toBlob();
 }
 if(!blob){setError("Add your signature before continuing.");return;}
 if(blob.size>250_000){setError("Signature image is too large. Use a smaller image.");return;}
 setSaving(true);setError("");
 try{
 const form=new FormData();form.set("name",name);form.set("consent",consent?"yes":"no");form.set("signature",new File([blob],"signature.png",{type:"image/png"}));
 const r=await fetch(`/api/signatures/${encodeURIComponent(params.token)}`,{method:"POST",body:form});const payload=await r.json();if(!r.ok)throw Error(payload.error??"Signing failed.");
 setData(old=>old?{...old,signed_at:payload.signed_at}:old);
 }catch(e){setError(e instanceof Error?e.message:"Signing failed.");}finally{setSaving(false);}
 }
 return <div className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-4xl items-center px-5"><Logo href="/"/></div></header><main className="mx-auto max-w-4xl space-y-6 px-5 py-10">
 {loading?<p className="text-slate-600">Loading secure document…</p>:!data?<div className="rounded-2xl bg-white p-8"><h1 className="text-xl font-bold">Signing link unavailable</h1><p className="mt-2 text-sm text-slate-600">{error}</p></div>:<>
 <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Secure E-Signature</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">{data.title}</h1><p className="mt-2 text-sm text-slate-600">Prepared for {data.signer_name}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.signed_at?"bg-emerald-100 text-emerald-800":"bg-amber-100 text-amber-800"}`}>{data.signed_at?"✓ Signature recorded":"Awaiting signature"}</span></div>
 <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex flex-wrap justify-between gap-2"><div><h2 className="font-bold text-slate-950">Document preview</h2><p className="mt-1 text-xs text-slate-500">Review the full document before signing.</p></div>{data.pdf_url&&<a href={data.pdf_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="text-sm font-bold text-indigo-700">Open PDF in new tab</a>}</div>{data.pdf_url?<iframe title="Document to sign" src={data.pdf_url} referrerPolicy="no-referrer" className="h-[520px] w-full rounded-lg border"/>:<p className="text-sm text-rose-700">Document preview unavailable. Do not sign until you can review it.</p>}</section>
 {data.signed_at?<section role="status" className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700" aria-hidden="true">✓</span><div><h2 className="text-xl font-extrabold text-slate-950">Your signature has been recorded</h2><p className="mt-2 text-sm leading-6 text-slate-600">Thank you. Your electronic signature was submitted successfully. No further action is required on this page.</p><dl className="mt-4 space-y-2 text-sm"><div><dt className="inline font-semibold text-slate-800">Document: </dt><dd className="inline text-slate-600">{data.title}</dd></div><div><dt className="inline font-semibold text-slate-800">Recorded on: </dt><dd className="inline text-slate-600">{new Date(data.signed_at).toLocaleString()}</dd></div></dl></div></div><div className="mt-5 space-y-3"><a href={`/api/signatures/${encodeURIComponent(params.token)}/download`} className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Download Signed PDF</a><p className="text-xs leading-6 text-slate-600">Your signed PDF includes an appended electronic signature record with your signature and signing time. This is an electronic signature, not a certificate-based digital signature. The private signing link expires after 7 days.</p></div></section>:<section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Sign this document</h2><p className="text-sm text-slate-600">Read the full PDF before signing. Your drawn or uploaded signature will appear on an electronic signature record page appended to the PDF.</p><label className="block text-sm font-semibold">Your full name<input value={name} onChange={e=>setName(e.target.value)} placeholder={data.signer_name} className="mt-2 w-full rounded-xl border p-3"/></label><div className="flex gap-2" role="group" aria-label="Signature method">
 <button type="button" aria-pressed={signMode==="draw"} onClick={()=>setSignMode("draw")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${signMode==="draw"?"bg-indigo-600 text-white":"border border-slate-200 text-slate-700"}`}>Draw signature</button>
 <button type="button" aria-pressed={signMode==="upload"} onClick={()=>setSignMode("upload")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${signMode==="upload"?"bg-indigo-600 text-white":"border border-slate-200 text-slate-700"}`}>Upload signature image</button>
 </div>
 {signMode==="draw"?<div className="rounded-xl border bg-slate-50 p-2"><SignaturePad ref={pad}/><button type="button" onClick={()=>pad.current?.clear()} className="text-xs font-bold text-indigo-700">Clear signature</button></div>:<div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
 <label className="block text-sm font-semibold">Upload your handwritten signature (PNG or JPG, maximum 250 KB)
 <input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={e=>setUploadedSignature(e.target.files?.[0]??null)} className="mt-2 block w-full text-sm"/>
 </label>
 <p className="text-xs text-slate-500">Use a clear signature image. It will be converted to PNG before saving. Do not upload a photo of your ID or another sensitive document.</p>
 </div>}<label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/><span>I have reviewed the document and agree to sign electronically.</span></label>{error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}<button type="button" disabled={saving||!consent||!data.pdf_url} onClick={sign} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50">{saving?"Saving signature…":"Agree & Sign"}</button></section>}
 </>}</main></div>;
}
