import Link from "next/link";

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" role="img" aria-label="SignDealDocs brand mark">
      <defs>
        <linearGradient id="sdd-brand" x1="3" y1="2" x2="46" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6558F5" /><stop offset="1" stopColor="#3128A6" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#sdd-brand)" />
      <path d="M14 12h13l7 7v16H14V12Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M27 12v8h7" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="m18 28 4 4 9-10" stroke="#A7F3D0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 37h16" stroke="white" strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5" aria-label="SignDealDocs home">
      <BrandMark className="h-9 w-9 shrink-0 drop-shadow-sm" />
      <span className="font-display text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">SignDealDocs</span>
    </Link>
  );
}
