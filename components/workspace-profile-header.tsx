"use client";

import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import type {User} from "@supabase/supabase-js";

export function WorkspaceSidebarProfile(){
 const router=useRouter();
 const [user,setUser]=useState<User|null>(null);
 const [open,setOpen]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const menuRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let active=true;
  void supabase.auth.getUser().then(({data})=>{if(active)setUser(data.user);});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(active){setUser(session?.user??null);setOpen(false);}});
  return ()=>{active=false;subscription.unsubscribe();};
 },[]);
 useEffect(()=>{
  if(!open)return;
  function dismiss(event:MouseEvent){if(menuRef.current&&!menuRef.current.contains(event.target as Node))setOpen(false);}
  function escape(event:KeyboardEvent){if(event.key==="Escape")setOpen(false);}
  document.addEventListener("mousedown",dismiss);
  document.addEventListener("keydown",escape);
  return ()=>{document.removeEventListener("mousedown",dismiss);document.removeEventListener("keydown",escape);};
 },[open]);
 async function signOut(){
  if(busy)return;
  setBusy(true);setError("");
  try{
   const {error:signOutError}=await supabase.auth.signOut();
   if(signOutError)throw signOutError;
   setOpen(false);
   router.replace("/");
   router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Could not sign out. Please try again.");setBusy(false);}
 }
 const email=user?.email??"";
 const displayName=String(user?.user_metadata?.full_name||user?.user_metadata?.name||email.split("@")[0]||"Account").trim();
 const initial=(displayName[0]||email[0]||"U").toUpperCase();
 return <div ref={menuRef} className="relative w-full">
  {user&&<>
   {open&&<div role="menu" aria-label="User profile" className="absolute bottom-full left-0 z-50 mb-2 w-full min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-slate-900 shadow-xl">
    <div className="border-b border-slate-100 px-4 py-3"><p className="truncate text-sm font-bold text-slate-900">{displayName}</p><p className="mt-1 truncate text-xs text-slate-500">{email}</p></div>
    <Link role="menuitem" href="/settings" onClick={()=>setOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Agency Settings</Link>
    <button role="menuitem" type="button" disabled={busy} onClick={()=>void signOut()} className="block w-full px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">{busy?"Signing out…":"Sign Out"}</button>
    {error&&<p role="alert" className="px-4 py-2 text-xs text-rose-600">{error}</p>}
   </div>}
   <button type="button" aria-label="Open user profile menu" aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(value=>!value)} className="flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300">
    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{initial}</span>
    <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-200" title={email}>{email}</span>
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open?"rotate-180":""}`}><path d="m6 9 6 6 6-6"/></svg>
   </button>
  </>}
 </div>;
}
