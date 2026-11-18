"use client";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {Logo} from "@/components/logo";
import {SignatureCapture} from "@/components/signature-capture";
type RequestData={title:string;signer_name:string;original_name:string;pdf_url:string|null;signature_url:string|null;signed_at:string|null;pages:{width:number;height:number}[]};
export default function SignPage(){
 const params=useParams<{token:string}>();

 const [data,setData]=useState<RequestData|null>(null);
 const [name,setName]=useState("");
 const [pageNumber,setPageNumber]=useState(0);
 const [x,setX]=useState(100);
 const [y,setY]=useState(100);
 const [width,setWidth]=useState(150);
 const [height,setHeight]=useState(50);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{let cancelled=false;fetch(`/api/signatures/${encodeURIComponent(params.token)}`,{cache:"no-store"}).then(async r=>{const payload=await r.json();if(!r.ok)throw Error(payload.error);if(!cancelled)setData(payload);}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"Link unavailable.");}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[params.token]);
 async function sign(pngDataUrl:string){
  if(!data)throw Error("Document unavailable.");
  const response=await fetch(pngDataUrl);
  const blob=await response.blob();
  if(blob.size>250_000)throw Error("Signature PNG exceeds 250 KB after conversion. Please use a smaller image.");
  const form=new FormData();form.set("name",name);form.set("consent","yes");form.set("signature",new File([blob],"signature.png",{type:"image/png"}));
  if(pageNumber>0)form.set("placement",JSON.stringify({pageNumber,x,y,width,height}));
  const result=await fetch(`/api/signatures/${encodeURIComponent(params.token)}`,{method:"POST",body:form});
  const payload=await result.json();
  if(!result.ok)throw Error(payload.error??"Signing failed.");
  setData(old=>old?{...old,signed_at:payload.signed_at}:old);
 }
 return <div className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-4xl items-center px-5"><Logo href="/"/></div></header><main className="mx-auto max-w-4xl space-y-6 px-5 py-10">
 {loading?<p className="text-slate-600">Loading secure document…</p>:!data?<div className="rounded-2xl bg-white p-8"><h1 className="text-xl font-bold">Signing link unavailable</h1><p className="mt-2 text-sm text-slate-600">{error}</p></div>:<>
 <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Secure E-Signature</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">{data.title}</h1><p className="mt-2 text-sm text-slate-600">Prepared for {data.signer_name}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.signed_at?"bg-emerald-100 text-emerald-800":"bg-amber-100 text-amber-800"}`}>{data.signed_at?"✓ Signature recorded":"Awaiting signature"}</span></div>
 <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex flex-wrap justify-between gap-2"><div><h2 className="font-bold text-slate-950">Document preview</h2><p className="mt-1 text-xs text-slate-500">Review the full document before signing.</p></div>{data.pdf_url&&<a href={data.pdf_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="text-sm font-bold text-indigo-700">Open PDF in new tab</a>}</div>{data.pdf_url?<iframe title="Document to sign" src={data.pdf_url} referrerPolicy="no-referrer" className="h-[520px] w-full rounded-lg border"/>:<p className="text-sm text-rose-700">Document preview unavailable. Do not sign until you can review it.</p>}</section>
 {data.signed_at?<section role="status" className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700" aria-hidden="true">✓</span><div><h2 className="text-xl font-extrabold text-slate-950">Your signature has been recorded</h2><p className="mt-2 text-sm leading-6 text-slate-600">Thank you. Your electronic signature was submitted successfully. No further action is required on this page.</p><dl className="mt-4 space-y-2 text-sm"><div><dt className="inline font-semibold text-slate-800">Document: </dt><dd className="inline text-slate-600">{data.title}</dd></div><div><dt className="inline font-semibold text-slate-800">Recorded on: </dt><dd className="inline text-slate-600">{new Date(data.signed_at).toLocaleString()}</dd></div></dl></div></div><div className="mt-5 space-y-3"><a href={`/api/signatures/${encodeURIComponent(params.token)}/download`} className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Download Signed PDF</a><p className="text-xs leading-6 text-slate-600">Your signed PDF includes the captured signature on the selected page or on an appended record page. This is an electronic signature, not a certificate-based digital signature. The private signing link expires after 7 days.</p></div></section>:<section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Sign this document</h2><p className="text-sm text-slate-600">Read the full PDF before signing. Choose an optional placement or append an electronic signature record page.</p><label className="block text-sm font-semibold">Your full name<input value={name} onChange={e=>setName(e.target.value)} placeholder={data.signer_name} className="mt-2 w-full rounded-xl border p-3"/></label><div className="space-y-3 rounded-xl border bg-slate-50 p-4"><label className="block text-sm font-semibold">Signature placement<select value={pageNumber} onChange={e=>setPageNumber(Number(e.target.value))} className="mt-2 w-full rounded-lg border p-2"><option value={0}>Append automatic signature page (recommended)</option>{(data.pages??[]).map((p,i)=><option key={i} value={i+1}>Embed on page {i+1} ({Math.round(p.width)} × {Math.round(p.height)} pt)</option>)}</select></label>{pageNumber>0&&<><p className="text-xs text-slate-600">PDF coordinates are in points, measured from the bottom-left corner of the selected page. Confirm placement against the PDF preview above.</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{([["X",x,setX],["Y",y,setY],["Width",width,setWidth],["Height",height,setHeight]] as const).map(([label,value,set])=><label key={label} className="text-xs font-semibold">{label} (pt)<input type="number" min={0} value={value} onChange={e=>set(Number(e.target.value))} className="mt-1 w-full rounded-lg border p-2"/></label>)}</div></>}</div><SignatureCapture onSign={sign} disabled={!name.trim()||!data.pdf_url}/></section>}
 </>}</main></div>;
}
