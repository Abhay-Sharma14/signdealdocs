"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {Logo} from "@/components/logo";
import {SiteFooter} from "@/components/site-footer";
import {supabase} from "@/lib/supabase";
type Item={id:string;token:string;title:string;signer_name:string;signer_email:string;signed_at:string|null;expires_at:string;revoked_at:string|null};
export default function NewSignaturePage(){
 const router=useRouter();
 const [ready,setReady]=useState(false);
 const [title,setTitle]=useState("");
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [file,setFile]=useState<File|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [created,setCreated]=useState("");
 const [shareTitle,setShareTitle]=useState("");
 const [shareEmail,setShareEmail]=useState("");
 const [copied,setCopied]=useState(false);
 const [copyError,setCopyError]=useState("");
 const [emailStatus,setEmailStatus]=useState(""); 
 const [emailSent,setEmailSent]=useState(false);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session)router.replace("/login?next=%2Fsignatures%2Fnew");else setReady(true);});},[router]);
 async function copyLink(){
  setCopyError("");
  try { await navigator.clipboard.writeText(created); setCopied(true); }
  catch { setCopied(false); setCopyError("Could not copy the link. Please select and copy it manually."); }
 }
 async function submit(e:FormEvent){
 e.preventDefault();setError("");setCreated("");setCopied(false);setCopyError("");
 if(!file||file.size>3_000_000){setError("Choose a PDF smaller than 3 MB.");return;}
 setBusy(true);
 try{
 const {data}=await supabase.auth.getSession();
 if(!data.session)throw Error("Please sign in again.");
 const form=new FormData();form.set("title",title);form.set("signer_name",name);form.set("signer_email",email);form.set("file",file);
 const res=await fetch("/api/signatures",{method:"POST",headers:{Authorization:`Bearer ${data.session.access_token}`},body:form});
 const payload=await res.json();if(!res.ok)throw Error(payload.error??"Could not create request.");
 const url=`${window.location.origin}/sign/${payload.request.token}`;setCreated(url);setShareTitle(title);setShareEmail(email);setEmailSent(payload.email_sent===true);setEmailStatus(payload.email_sent?"Invitation emailed to signer.":"Email delivery could not be confirmed. Please share the link manually.");
 setTitle("");setName("");setEmail("");setFile(null);
 }catch(cause){setError(cause instanceof Error?cause.message:"Request failed.");}finally{setBusy(false);}
 }
 return <div className="flex min-h-screen flex-col bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5"><Logo href="/dashboard"/><Link href="/dashboard" className="text-sm font-semibold text-indigo-700">Dashboard</Link></div></header>
 <main className="mx-auto w-full max-w-5xl flex-1 space-y-7 px-5 py-10"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Standalone e-sign</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">Send for E-Signature</h1><p className="mt-2 text-sm text-slate-600">Send documents for electronic signature in minutes. Upload your PDF, enter signer details, and share a private link.</p></div>
 {!ready?<p>Checking your session…</p>:<div className="grid gap-6 md:grid-cols-[1fr_1fr]"><form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
 <label className="block text-sm font-semibold">Document title<input required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="Service Agreement"/></label>
 <label className="block text-sm font-semibold">Signer name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="Full legal name"/></label>
 <label className="block text-sm font-semibold">Signer email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="client@example.com"/></label>
 <label className="block text-sm font-semibold">PDF document (max 3 MB)<input required type="file" accept="application/pdf,.pdf" onChange={e=>setFile(e.target.files?.[0]??null)} className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
 {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
 <button disabled={busy} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white disabled:opacity-50">{busy?"Creating…":"Create Secure Signing Link"}</button>
 <p className="text-xs text-slate-500">Signing links expire after 7 days for security. We will automatically email the link to your signer.</p>
 {created&&<div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
 <div className="flex items-center gap-2"><span aria-hidden="true" className="text-xl">✅</span><h2 className="text-base font-extrabold text-slate-900">Secure signing link created</h2></div>
 <label htmlFor="created-signing-link" className="mt-4 block text-xs font-semibold text-slate-500">Your secure signing link</label>
 <input id="created-signing-link" readOnly value={created} onFocus={e=>e.currentTarget.select()} className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-3 font-mono text-xs text-gray-700 outline-none focus:ring-2 focus:ring-violet-300"/>
 <div role="status" className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-700">{emailSent&&<span className="rounded-full bg-emerald-100 px-2.5 py-1 font-bold text-emerald-800">✓ Email Sent</span>}<span>{emailStatus}</span></div>
 <button type="button" onClick={copyLink} aria-live="polite" className="mt-4 w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700">{copied?"✓ Copied!":"Copy Link"}</button>
 {copyError&&<p role="alert" className="mt-2 text-xs text-rose-700">{copyError}</p>}
 <a href={`https://wa.me/?text=${encodeURIComponent(`Please review and sign ${shareTitle}: ${created}. This link expires after 7 days.`)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50">
 <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current text-green-600"><path d="M12.04 2a9.9 9.9 0 0 0-8.57 14.86L2 22l5.3-1.39A9.97 9.97 0 1 0 12.04 2Zm0 18.18a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.14.82.84-3.06-.2-.32a8.2 8.2 0 1 1 6.98 3.88Zm4.5-6.15c-.25-.13-1.48-.73-1.7-.81-.23-.08-.39-.12-.55.13-.17.25-.64.81-.78.98-.14.16-.28.18-.53.06-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.22-1.45-1.36-1.7-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.49c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.11.15 1.53.09.47-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>
 Share via WhatsApp</a>
 <a href={`mailto:${encodeURIComponent(shareEmail)}?subject=${encodeURIComponent(`Signature requested: ${shareTitle}`)}&body=${encodeURIComponent(`Please review and sign ${shareTitle}: ${created}\n\nThis link expires after 7 days.`)}`} className="mt-3 ml-2 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">Send via Email</a>
 </div>}
 </form><aside className="space-y-5">

 <section className="rounded-2xl border border-slate-200 bg-gray-50 p-6 shadow-sm"><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-600"><span aria-hidden="true" className="text-lg">🛡</span>Why use SignDealDocs?</p><h2 className="mt-3 text-xl font-extrabold text-slate-950">Legally binding &amp; secure</h2><ul className="mt-5 space-y-3 text-sm font-semibold text-slate-700"><li>✓ ESIGN &amp; UETA compliant signatures</li><li>✓ Tamper-proof audit trail</li><li>✓ Instant PDF flattening</li></ul></section>
 </aside></div>}
 </main><SiteFooter compact /></div>;
}
