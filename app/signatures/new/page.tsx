"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {Logo} from "@/components/logo";
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
 const [items,setItems]=useState<Item[]>([]);
 const [created,setCreated]=useState("");
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session)router.replace("/login");else setReady(true);});},[router]);
 useEffect(()=>{if(!ready)return;supabase.auth.getSession().then(async({data})=>{const token=data.session?.access_token;if(!token)return;const res=await fetch("/api/signatures",{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});if(res.ok){const payload=await res.json();setItems(payload.requests??[]);}});},[ready]);
 async function submit(e:FormEvent){
 e.preventDefault();setError("");setCreated("");
 if(!file||file.size>3_000_000){setError("Choose a PDF smaller than 3 MB.");return;}
 setBusy(true);
 try{
 const {data}=await supabase.auth.getSession();
 if(!data.session)throw Error("Please sign in again.");
 const form=new FormData();form.set("title",title);form.set("signer_name",name);form.set("signer_email",email);form.set("file",file);
 const res=await fetch("/api/signatures",{method:"POST",headers:{Authorization:`Bearer ${data.session.access_token}`},body:form});
 const payload=await res.json();if(!res.ok)throw Error(payload.error??"Could not create request.");
 const url=`${window.location.origin}/sign/${payload.request.token}`;setCreated(url);
 setItems(old=>[{id:payload.request.id,token:payload.request.token,title,signer_name:name,signer_email:email,signed_at:null,expires_at:new Date(Date.now()+7*86400000).toISOString(),revoked_at:null},...old]);
 setTitle("");setName("");setEmail("");setFile(null);
 }catch(cause){setError(cause instanceof Error?cause.message:"Request failed.");}finally{setBusy(false);}
 }
 return <div className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5"><Logo href="/dashboard"/><Link href="/dashboard" className="text-sm font-semibold text-indigo-700">Dashboard</Link></div></header>
 <main className="mx-auto max-w-5xl space-y-7 px-5 py-10"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Standalone e-sign</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">Request a signature</h1><p className="mt-2 text-sm text-slate-600">Upload a PDF and share a secure signing link. No proposal or document collection required.</p></div>
 {!ready?<p>Checking your session…</p>:<div className="grid gap-6 md:grid-cols-[1fr_1fr]"><form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
 <label className="block text-sm font-semibold">Document title<input required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="Service Agreement"/></label>
 <label className="block text-sm font-semibold">Signer name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="Full legal name"/></label>
 <label className="block text-sm font-semibold">Signer email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="client@example.com"/></label>
 <label className="block text-sm font-semibold">PDF document (max 3 MB)<input required type="file" accept="application/pdf,.pdf" onChange={e=>setFile(e.target.files?.[0]??null)} className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
 <p className="text-xs text-slate-500">Signing link expires after 7 days. Share the link privately; anyone with the link can open the PDF. No automatic email is sent.</p>
 {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
 <button disabled={busy} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white disabled:opacity-50">{busy?"Creating…":"Create signature request"}</button>
 {created&&<div className="rounded-xl bg-indigo-50 p-3 text-sm"><p className="font-bold">Link ready — send privately</p><p className="mt-2 break-all text-xs">{created}</p><button type="button" onClick={()=>navigator.clipboard.writeText(created)} className="mt-2 font-bold text-indigo-700">Copy link</button></div>}
 </form><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Recent signature requests</h2><div className="mt-4 space-y-3">{items.length===0?<p className="text-sm text-slate-500">No requests yet.</p>:items.map(item=><div key={item.id} className="rounded-xl border border-slate-100 p-3"><p className="font-bold text-slate-900">{item.title}</p><p className="text-xs text-slate-500">{item.signer_name} · {item.signer_email}</p><p className="mt-1 text-xs font-semibold text-indigo-600">{item.signed_at?"Signed":item.revoked_at?"Revoked":new Date(item.expires_at).getTime()<Date.now()?"Expired":"Awaiting signature"}</p><button type="button" onClick={()=>navigator.clipboard.writeText(`${window.location.origin}/sign/${item.token}`)} className="mt-2 text-xs font-bold text-indigo-700">Copy signing link</button></div>)}</div></section></div>}
 </main></div>;
}
