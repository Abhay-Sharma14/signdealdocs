import Link from "next/link";
import { Logo } from "@/components/logo";

const steps = [
  {
    index: "01",
    title: "AI Proposal & Pricing Composer",
    copy: "Enter rough notes; AI drafts localized deliverables & terms.",
  },
  {
    index: "02",
    title: "Digital E-Signature",
    copy: "The client reviews scope and signs on an HTML5 pad. No password required.",
  },
  {
    index: "03",
    title: "Client Document Upload Vault",
    copy: "Unlocks automatically right after the client signs.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-brand px-3.5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#4338ca]"
              style={{ boxShadow: "0 8px 20px -6px var(--brand-glow)" }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="grid items-center gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-brand-border bg-brand-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                SignDealDocs
              </span>
              <span className="text-xs text-slate-500">
                1 Magic Link = AI Proposal + E-Sign + Document Vault
              </span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Configure the proposal. Send one link. Close the engagement.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              An executive deal room for agencies and studios. Draft the scope
              with AI, publish a passwordless client portal, collect a
              signature, and receive the files you need to start work.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition-transform hover:bg-[#4338ca] active:scale-[0.99]"
                style={{ boxShadow: "0 8px 20px -4px var(--brand-glow)" }}
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Login
              </Link>
            </div>
          </div>

          <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg lg:col-span-5">
            <div className="bg-slate-950 px-5 py-5 text-white">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Client Deal & Onboarding Room
              </p>
              <h2 className="mt-2 font-display text-xl font-extrabold leading-tight">
                Complete Brand Identity & High-Converting Marketing Website
              </h2>
              <p className="mt-2 text-xs text-slate-300">
                Prepared for Acme Global Corp · Apex Digital Studio
              </p>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                <span className="text-xs font-semibold text-slate-300">
                  Total Deal Investment
                </span>
                <span className="font-mono text-lg font-extrabold">$3,200</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                No password required. Review scope, sign digitally, and drop
                your project files below.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {["Review", "E-Sign", "Vault"].map((label, index) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2"
                  >
                    <div className="font-mono text-[10px] font-bold text-brand">
                      0{index + 1}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.index}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand font-mono text-xs font-bold text-white">
                {step.index}
              </span>
              <h2 className="mt-3 font-display text-base font-extrabold text-slate-950">
                {step.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {step.copy}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand">
              Agency Studio
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-950">
              Configure Client Proposal & Onboarding Checklist
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Toggle or add the files you need from the client to kick off
              work. They upload directly into your vault after signing — Signed
              NDA, Brand Assets / Logo, GST / Tax ID, or any custom request.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Magic link
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              signdealdocs/d/your-client
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Publish & open a live client portal. One link carries the
              proposal, the signature, and the document vault.
            </p>
          </article>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-semibold text-slate-700">SignDealDocs</span>
          <span>AI Proposals, E-Signature & Client Onboarding</span>
        </div>
      </footer>
    </div>
  );
}
