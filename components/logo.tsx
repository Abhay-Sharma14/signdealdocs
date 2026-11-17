import Link from "next/link";

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" role="img" aria-label="SignDealDocs signature document logo">
      <defs>
        <linearGradient id="sdd-logo-gradient" x1="8" y1="8" x2="39" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3538A8" />
          <stop offset=".58" stopColor="#5645DD" />
          <stop offset="1" stopColor="#873CF0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="#F0ECFF" />
      <path d="M12 8.5h16l8 8V38a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V10.5a2 2 0 0 1 2-2Z" fill="#fff" stroke="url(#sdd-logo-gradient)" strokeWidth="2.7" strokeLinejoin="round" />
      <path d="M28 8.5v8h8" fill="#DDD2FF" stroke="url(#sdd-logo-gradient)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="m16 32 5-5 3.3 4.2 3.1-6 2.3 3.1" stroke="#3538A8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19 34 6 2 13-15" stroke="#783CED" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5" aria-label="SignDealDocs home">
      <BrandMark className="h-9 w-9 shrink-0" />
      <span className="font-display text-lg font-extrabold tracking-tight text-[#111C33] sm:text-xl">Sign<span className="text-[#5144D5]">Deal</span>Docs</span>
    </Link>
  );
}
