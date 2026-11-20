"use client";
import Link from "next/link";
import {useEffect,useRef,useState,type ChangeEvent,type DragEvent,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {Logo} from "@/components/logo";
import {SiteFooter} from "@/components/site-footer";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import {supabase} from "@/lib/supabase";
export default function NewSignaturePage(){
 const router=useRouter();
 const [ready,setReady]=useState(false);
 const [title,setTitle]=useState("");
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [file,setFile]=useState<File|null>(null);
 const [dragging,setDragging]=useState(false);
 const [mode,setMode]=useState<"upload"|"ai">("upload");
 const [expiration,setExpiration]=useState(7);
 const [pageCount,setPageCount]=useState<number|null>(null);
 const [previewUrl,setPreviewUrl]=useState("");
 const [documentType,setDocumentType]=useState("Service Agreement");
 const [law,setLaw]=useState("India (Indian Contract Act)");
 const [scope,setScope]=useState("");
 const [draft,setDraft]=useState("");
 const [agencyName,setAgencyName]=useState("Your Agency");
 const [generating,setGenerating]=useState(false);
 const [pdfBusy,setPdfBusy]=useState(false);
 useEffect(()=>{if(!file)return;const url=URL.createObjectURL(file);let cancelled=false;void file.arrayBuffer().then(bytes=>PDFDocument.load(bytes)).then(pdf=>{if(!cancelled){setPreviewUrl(url);setPageCount(pdf.getPageCount());}}).catch(()=>{if(!cancelled){setPreviewUrl(url);setPageCount(null);}});return()=>{cancelled=true;URL.revokeObjectURL(url);};},[file]);
 async function generate(refinement=""){setGenerating(true);setError("");try{const {data}=await supabase.auth.getSession();if(!data.session)throw Error("Sign in again.");const res=await fetch("/api/signatures/draft",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({type:documentType,law,scope,title,signer:name,refinement,previous:draft})});const payload=await res.json();if(!res.ok)throw Error(payload.error||"Draft failed.");setDraft(payload.draft);setAgencyName(payload.agencyName||"Your Agency");}catch(e){setError(e instanceof Error?e.message:"AI drafting failed.");}finally{setGenerating(false);}}
 async function draftPdf(){const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);const margin=46;const width=595;const maxWidth=width-margin*2;let page=pdf.addPage([595,842]);let y=792;
 const addLine=(text:string,size=10,heavy=false)=>{const face=heavy?bold:font;const sanitized=text.replace(/[^\x20-\x7E]/g," ").trim();if(!sanitized){y-=12;return;}const words=sanitized.split(/\s+/);let line="";const flush=()=>{if(!line)return;if(y<60){page=pdf.addPage([595,842]);y=792;}page.drawText(line,{x:margin,y,size,font:face,color:rgb(0.15,0.2,0.3)});y-=size+6;line="";};for(const word of words){const test=line?line+" "+word:word;if(face.widthOfTextAtSize(test,size)>maxWidth&&line)flush();line=line?line+" "+word:word;}flush();};
 addLine(agencyName,13,true);addLine(title,18,true);addLine("Prepared for: "+name);addLine("Effective date: "+new Date().toLocaleDateString("en-GB"));addLine("Governing law: "+law);y-=14;for(const paragraph of draft.split("\n"))addLine(paragraph,10,/^\d+[.)]\s/.test(paragraph));const bytes=await pdf.save();return new File([new Uint8Array(bytes)],(title||"agency-agreement").replace(/[^a-z0-9-_]/gi,"-")+".pdf",{type:"application/pdf"});}

 const fileInput=useRef<HTMLInputElement>(null);
 function chooseFile(next:File|null){
  if(next && (next.size>15_000_000 || (!next.name.toLowerCase().endsWith(".pdf") && next.type!=="application/pdf"))){setError("Choose a PDF smaller than 15 MB.");return;}
  setPreviewUrl("");setPageCount(null);setFile(next);setError("");
 }
 function onFileChange(event:ChangeEvent<HTMLInputElement>){chooseFile(event.target.files?.[0]??null);}
 function onFileDrop(event:DragEvent<HTMLDivElement>){event.preventDefault();setDragging(false);chooseFile(event.dataTransfer.files?.[0]??null);}
 function removeFile(){setFile(null);if(fileInput.current)fileInput.current.value="";}

 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [created,setCreated]=useState("");
 const [shareTitle,setShareTitle]=useState("");
 const [copied,setCopied]=useState(false);
 const copyResetTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(copyResetTimer.current)clearTimeout(copyResetTimer.current);},[]);
 const [copyError,setCopyError]=useState("");
 const [emailStatus,setEmailStatus]=useState(""); 
 const [emailSent,setEmailSent]=useState(false);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session)router.replace("/login?next=%2Fsignatures%2Fnew");else setReady(true);});},[router]);
 async function copyLink(){
  setCopyError("");
  try { await navigator.clipboard.writeText(created); setCopied(true); if(copyResetTimer.current)clearTimeout(copyResetTimer.current);copyResetTimer.current=setTimeout(()=>setCopied(false),2000); }
  catch { setCopied(false); setCopyError("Could not copy the link. Please select and copy it manually."); }
 }
 async function submit(e:FormEvent){
 e.preventDefault();setError("");setCreated("");setCopied(false);setCopyError("");
 if(mode==="upload"&&(!file||file.size>15_000_000)){setError("Choose a PDF smaller than 15 MB.");return;}
 if(mode==="ai"&&!draft.trim()){setError("Generate a draft first.");return;}
 setBusy(true);
 try{
 const {data}=await supabase.auth.getSession();
 if(!data.session)throw Error("Please sign in again.");
 const form=new FormData();form.set("title",title);form.set("signer_name",name);form.set("signer_email",email);form.set("expiration_days",String(expiration));setPdfBusy(mode==="ai");const selected=mode==="ai"?await draftPdf():file;if(!selected)throw Error("Select a PDF.");form.set("file",selected);setPdfBusy(false);
 const res=await fetch("/api/signatures",{method:"POST",headers:{Authorization:`Bearer ${data.session.access_token}`},body:form});
 const payload=await res.json();if(!res.ok)throw Error(payload.error??"Could not create request.");
 const base=(process.env.NEXT_PUBLIC_APP_URL||window.location.origin).replace(/\/$/,"");const url=`${base}/sign/${payload.request.token}`;setCreated(url);setShareTitle(title);setEmailSent(payload.email_sent===true);setEmailStatus(payload.email_sent?"An email invitation has been sent to the signer. You can also share the link manually below.":"Signing link created. You can share the link manually below.");
 setTitle("");setName("");setEmail("");removeFile();
 }catch(cause){setError(cause instanceof Error?cause.message:"Request failed.");}finally{setBusy(false);setPdfBusy(false);}
 }
 return <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-50"><header className="shrink-0 border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5"><Link href="/dashboard" className="text-sm font-semibold text-slate-700 hover:text-indigo-700">← Back to Dashboard</Link><span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">✨ AI-Powered Legal &amp; Proposal Studio</span><Logo href="/dashboard"/></div></header>
 <main className="mx-auto min-h-0 w-full max-w-7xl flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 py-8"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Document &amp; E-Sign Studio</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">Send for E-Signature</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">Upload an existing PDF or generate a tailored, legally structured agreement with AI—ready for instant e-signature.</p></div>
 {!ready?<p>Checking your session…</p>:<div className="grid items-start gap-6 lg:grid-cols-12"><form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
 <h2 className="text-lg font-bold">Document setup</h2>
 <label className="block text-sm font-semibold">Document Title<input required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Master Service Agreement — Web Redesign" className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label>
 <label className="block text-sm font-semibold">Signer Full Name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full legal name" className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label>
 <label className="block text-sm font-semibold">Signer Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="client@example.com" className="mt-2 w-full rounded-xl border border-slate-200 p-3"/></label>
 <label className="block text-sm font-semibold">Signing Link Expiration<select value={expiration} onChange={e=>setExpiration(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3">{[7,14,30].map(days=><option key={days} value={days}>{days} days</option>)}</select></label>
 <div role="tablist" aria-label="Document source" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">{([["upload","Upload PDF"],["ai","Draft with AI ✨"]] as const).map(([value,label])=><button type="button" role="tab" aria-selected={mode===value} key={value} onClick={()=>{setMode(value);setError("");}} className={`rounded-lg px-3 py-3 text-sm font-bold ${mode===value?"border border-slate-200 bg-white text-indigo-700 shadow-sm":"text-slate-600"}`}>{label}</button>)}</div>
 {mode==="upload"?<div><p className="mb-2 text-sm font-semibold">PDF document (max 15 MB)</p><div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={e=>{e.preventDefault();setDragging(false);}} onDrop={onFileDrop} className={`rounded-xl border-2 border-dashed p-5 text-center ${dragging?"border-indigo-500 bg-indigo-50":"border-slate-200 bg-slate-50"}`}><input ref={fileInput} id="signature-pdf" type="file" accept="application/pdf,.pdf" onChange={onFileChange} className="sr-only"/>{file?<div><p className="break-all text-sm font-semibold">📄 {file.name}</p><p className="mt-1 text-xs text-slate-500">{(file.size/1024/1024).toFixed(2)} MB · {pageCount??"—"} pages</p><label htmlFor="signature-pdf" className="mt-3 inline-block cursor-pointer text-sm font-bold text-indigo-700">Replace file</label></div>:<label htmlFor="signature-pdf" className="block cursor-pointer py-6 text-sm font-semibold text-slate-700">↑ Click to upload or drag and drop<p className="mt-2 text-xs font-normal text-slate-500">PDF up to 15 MB</p></label>}</div></div>:<div className="space-y-4"><div><p className="mb-2 text-sm font-semibold">Document type</p><div className="flex flex-wrap gap-2">{["Service Agreement","Project Proposal","NDA (Non-Disclosure)","Statement of Work (SOW)","Retainer Contract"].map(type=><button type="button" key={type} onClick={()=>setDocumentType(type)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${documentType===type?"border-indigo-300 bg-indigo-50 text-indigo-700":"border-slate-200 text-slate-600"}`}>{type}</button>)}</div></div><label className="block text-sm font-semibold">Jurisdiction / Governing Law<select value={law} onChange={e=>setLaw(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3">{["India (Indian Contract Act)","United States (Delaware / General)","United Kingdom / EU"].map(value=><option key={value}>{value}</option>)}</select></label><label className="block text-sm font-semibold">Key Scope &amp; Commercials<textarea rows={5} maxLength={6000} value={scope} onChange={e=>setScope(e.target.value)} placeholder="Build a 5-page Next.js website for ₹85,000, 50% advance, 4-week timeline, 2 revision rounds" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label><button type="button" disabled={generating||!scope.trim()||!title.trim()||!name.trim()} onClick={()=>void generate()} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{generating?"✨ Drafting your agreement…":"✨ Generate Document Draft"}</button>{generating&&<div role="status" className="animate-pulse space-y-2"><div className="h-3 w-3/4 rounded bg-slate-200"/><div className="h-3 w-full rounded bg-slate-200"/><div className="h-3 w-5/6 rounded bg-slate-200"/></div>}<p className="text-xs text-slate-500">AI drafts require human and legal review before sending. Governing law selection does not guarantee enforceability.</p></div>}
 {error&&<p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
 <button disabled={busy||!title.trim()||!name.trim()||!email.trim()||(mode==="upload"?!file:!draft.trim())} className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-bold text-white shadow-sm enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none">{busy?(pdfBusy?"Preparing PDF…":"Creating…"):"Create Secure Signing Link"}</button><p className="text-xs leading-5 text-slate-500">ESIGN &amp; UETA support · Signing evidence &amp; audit trail · Signed PDF output. Links expire after {expiration} days; email delivery depends on provider availability.</p>
  {created&&<div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
 <div className="flex items-center gap-2"><span aria-hidden="true" className="text-xl">✅</span><h2 className="text-base font-extrabold text-slate-900">Secure signing link created</h2></div>
 <label htmlFor="created-signing-link" className="mt-4 block text-xs font-semibold text-slate-500">Your secure signing link</label>
 <input id="created-signing-link" readOnly value={created} onFocus={e=>e.currentTarget.select()} className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-3 font-mono text-xs text-gray-700 outline-none focus:ring-2 focus:ring-violet-300"/>
 <div role="status" className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-700">{emailSent&&<span className="rounded-full bg-emerald-100 px-2.5 py-1 font-bold text-emerald-800">✓ Email Sent</span>}<span>{emailStatus}</span></div>
 <button type="button" onClick={copyLink} aria-live="polite" className="mt-4 w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700">{copied?"✓ Copied!":"Copy Link"}</button>
 {copyError&&<p role="alert" className="mt-2 text-xs text-rose-700">{copyError}</p>}
 <a href={`https://wa.me/?text=${encodeURIComponent(`Please review and sign ${shareTitle}: ${created}. This link expires after ${expiration} days.`)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50">
 <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current text-green-600"><path d="M12.04 2a9.9 9.9 0 0 0-8.57 14.86L2 22l5.3-1.39A9.97 9.97 0 1 0 12.04 2Zm0 18.18a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.14.82.84-3.06-.2-.32a8.2 8.2 0 1 1 6.98 3.88Zm4.5-6.15c-.25-.13-1.48-.73-1.7-.81-.23-.08-.39-.12-.55.13-.17.25-.64.81-.78.98-.14.16-.28.18-.53.06-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.22-1.45-1.36-1.7-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.49c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.11.15 1.53.09.47-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>
 Share via WhatsApp</a>

 </div>}
 </form><aside className="space-y-4 lg:col-span-7"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4"><div><h2 className="font-bold">Live Document Workspace</h2><p className="text-xs text-slate-500">{mode==="ai"?"Editable AI draft":"PDF document preview"}</p></div>{mode==="ai"&&draft&&<div className="flex flex-wrap gap-2">{([["stricter","Make Stricter"],["simplify","Simplify Language"],["payment","Add Payment Terms"],["regenerate","Regenerate"]] as const).map(([value,label])=><button type="button" disabled={generating} key={value} onClick={()=>void generate(value)} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-50">{label}</button>)}</div>}</div>
 {mode==="upload"&&previewUrl?<div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><iframe title="Selected PDF preview" src={previewUrl+"#toolbar=0&navpanes=0&scrollbar=0"} className="block h-[720px] w-full bg-white"/><p className="border-t border-slate-200 p-3 text-xs text-slate-500">{file?.name} · {pageCount??"Unknown"} pages</p></div>:mode==="ai"&&draft?<div className="mx-auto max-w-[690px] rounded-xl border border-slate-200 bg-white px-7 py-10 shadow-sm sm:px-12"><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{agencyName}</p><h3 className="mt-4 text-2xl font-bold">{title}</h3><p className="mt-2 text-xs text-slate-500">Prepared for {name} · {new Date().toLocaleDateString()} · {law}</p><textarea aria-label="Edit generated agreement" value={draft} onChange={e=>setDraft(e.target.value)} rows={34} className="mt-8 w-full resize-y border-0 bg-white text-sm leading-7 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100"/><p className="mt-4 border-t pt-4 text-xs text-slate-500">Review and edit all clauses before creating the signing link.</p></div>:<div className="rounded-2xl border border-dashed border-slate-200 bg-white p-7"><p className="text-sm font-semibold text-slate-700">Quick-start templates</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{[["1-Click Agency MSA","Service Agreement"],["Standard Mutual NDA","NDA (Non-Disclosure)"],["Website Design SOW","Statement of Work (SOW)"]].map(([label,type])=><button type="button" key={label} onClick={()=>{setMode("ai");setDocumentType(type);}} className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left text-sm font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50">📄<span className="mt-3 block">{label}</span><span className="mt-2 block text-xs font-normal text-slate-500">Customize with AI →</span></button>)}</div><p className="mt-7 text-xs text-slate-500">Electronic signing · Document audit evidence · Signed PDF</p></div>}</aside></div>}</main><SiteFooter compact /></div>;
}
