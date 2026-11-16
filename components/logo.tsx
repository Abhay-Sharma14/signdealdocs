import Link from "next/link";

export function Logo({ href="/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 shrink-0">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white"
        style={{ boxShadow: "0 4px 14px var(--brand-glow)" }}
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15l2 2 4-4" />
        </svg>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="font-display text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
          SignDealDocs
        </span>
      </span>
    </Link>
  );
}
