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
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 useEffect(()=>{let cancelled=false;fetch(`/api/signatures/${encodeURIComponent(params.token)}`,{cache:"no-store"}).then(async r=>{const payload=await r.json();if(!r.ok)throw Error(payload.error);if(!cancelled)setData(payload);}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"Link unavailable.");}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[params.token]);
 async function sign(){
 const blob=await pad.current?.toBlob();if(!blob){setError("Draw your signature first.");return;}
 setSaving(true);setError("");
 try{
 const form=new FormData();form.set("name",name);form.set("consent",consent?"yes":"no");form.set("signature",new File([blob],"signature.png",{type:"image/png"}));
 const r=await fetch(`/api/signatures/${encodeURIComponent(params.token)}`,{method:"POST",body:form});const payload=await r.json();if(!r.ok)throw Error(payload.error??"Signing failed.");
 setData(old=>old?{...old,signed_at:payload.signed_at}:old);
 }catch(e){setError(e instanceof Error?e.message:"Signing failed.");}finally{setSaving(false);}
 }
 return <div className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-4xl items-center px-5"><Logo href="/"/></div></header><main className="mx-auto max-w-4xl space-y-6 px-5 py-10">
 {loading?<p className="text-slate-600">Loading secure document…</p>:!data?<div className="rounded-2xl bg-white p-8"><h1 className="text-xl font-bold">Signing link unavailable</h1><p className="mt-2 text-sm text-slate-600">{error}</p></div>:<>
 <div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Document signature request</p><h1 className="mt-2 text-3xl font-extrabold">{data.title}</h1><p className="mt-2 text-sm text-slate-600">Requested signer: {data.signer_name}</p></div>
 <section className="rounded-2xl border bg-white p-5"><div className="mb-3 flex flex-wrap justify-between gap-2"><h2 className="font-bold">Review the original PDF</h2>{data.pdf_url&&<a href={data.pdf_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="text-sm font-bold text-indigo-700">Open PDF in new tab</a>}</div>{data.pdf_url?<iframe title="Document to sign" src={data.pdf_url} referrerPolicy="no-referrer" className="h-[520px] w-full rounded-lg border"/>:<p className="text-sm text-rose-700">Document preview unavailable. Do not sign until you can review it.</p>}</section>
 {data.signed_at?<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><h2 className="text-xl font-bold text-emerald-900">Signature recorded</h2><p className="mt-2 text-sm text-emerald-800">Signed {new Date(data.signed_at).toLocaleString()}. The document owner retains the signature record. A digitally sealed PDF is not generated yet.</p></div>:<section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Sign this document</h2><p className="text-sm text-slate-600">Read the full PDF before signing. This records a drawn electronic signature separately from the original document; it does not stamp or certify the PDF.</p><label className="block text-sm font-semibold">Your full name<input value={name} onChange={e=>setName(e.target.value)} placeholder={data.signer_name} className="mt-2 w-full rounded-xl border p-3"/></label><div className="rounded-xl border bg-slate-50 p-2"><SignaturePad ref={pad}/><button type="button" onClick={()=>pad.current?.clear()} className="text-xs font-bold text-indigo-700">Clear signature</button></div><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/><span>I have reviewed the document and agree to sign electronically.</span></label>{error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}<button type="button" disabled={saving||!consent||!data.pdf_url} onClick={sign} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50">{saving?"Saving signature…":"Agree & Sign"}</button></section>}
 </>}</main></div>;
}
