"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" role="img" aria-label="SignDealDocs signature document logo">
      <defs><linearGradient id="sdd-logo-gradient" x1="8" y1="8" x2="39" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#3538A8" /><stop offset=".58" stopColor="#5645DD" /><stop offset="1" stopColor="#873CF0" /></linearGradient></defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="#F0ECFF" />
      <path d="M12 8.5h16l8 8V38a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V10.5a2 2 0 0 1 2-2Z" fill="#fff" stroke="url(#sdd-logo-gradient)" strokeWidth="2.7" strokeLinejoin="round" />
      <path d="M28 8.5v8h8" fill="#DDD2FF" stroke="url(#sdd-logo-gradient)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M15.5 33.5c3-4.5 4.3-6.5 5.8-6.1 1.4.4 1.2 3.4 2.6 3.4 1.1 0 1.6-2.6 3.2-3.5" stroke="#3538A8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m24 35 9.6-12.5 3.5 2.8-9.6 12.4-4.4 1.4Z" fill="url(#sdd-logo-gradient)" stroke="#3538A8" strokeWidth=".7" strokeLinejoin="round" />
      <path d="m24 35-.9 4.1 4.4-1.4" fill="#3538A8" />
      <path d="m32.8 22.6 2.2-2.8c.7-.9 1.8-1 2.7-.3l1 .8c.9.7 1 1.8.3 2.7l-2.2 2.8" fill="#8C4AEF" />
      <path d="M16 36c5.3 1.3 11.2.5 16-3.4" stroke="#7B3FE9" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href }: { href?: string }) {
  const [destination, setDestination] = useState(href ?? "/");
  useEffect(() => {
    if (href) { setDestination(href); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setDestination(data.session ? "/dashboard" : "/");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setDestination(session ? "/dashboard" : "/");
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [href]);
  return (
    <Link href={destination} className="flex shrink-0 items-center gap-2.5" aria-label="SignDealDocs home">
      <BrandMark className="h-9 w-9 shrink-0" />
      <span className="font-display text-lg font-extrabold tracking-tight text-[#111C33] sm:text-xl">Sign<span className="text-[#5144D5]">Deal</span>Docs</span>
    </Link>
  );
}
