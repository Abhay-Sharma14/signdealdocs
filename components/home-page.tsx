"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { useLocale } from "@/components/locale-provider";

export default function HomePage() {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { number: "01", icon: "✦", title: "Branded Deal Rooms", copy: "Send one secure link for the proposal, contract signing and deposit step." },
    { number: "02", icon: "✍", title: "White-labeling", copy: "Put your agency name, logo and brand colors front and center." },
    { number: "03", icon: "▤", title: "Client Onboarding", copy: "Collect project files and assets directly inside each client portal." },
  ];
  const steps = [
    { icon: "✎", title: t("how1"), copy: t("how1d") },
    { icon: "↗", title: t("how2"), copy: t("how2d") },
    { icon: "✓", title: t("how3"), copy: t("how3d") },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            <a href="#product" className="text-sm font-semibold text-slate-700 hover:text-indigo-700">Features</a>
            <Link href="/signatures/new" className="text-sm font-semibold text-slate-700 hover:text-indigo-700">Quick Sign</Link>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-indigo-700">{t("navHow")}</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-700 hover:text-indigo-700">{t("navPricing")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 md:inline-flex">{t("login")}</Link>
            <Link href="/login" className="hidden rounded-xl bg-[#4338CA] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#3730A3] sm:inline-flex">Get started free</Link>
            <button type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-800 lg:hidden">{mobileMenuOpen ? "×" : "☰"}</button>
          </div>
        </div>
        {mobileMenuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <a href="#product" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">Features</a>
            <Link href="/signatures/new" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">Quick Sign</Link>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">{t("navHow")}</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">{t("navPricing")}</a>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">Log in</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white">Get started free</Link>
          </div>
        </nav>}
      </header>
      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/70">
          <div className="pointer-events-none absolute -right-40 top-12 -z-10 h-[550px] w-[550px] rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[.95fr_1.05fr] lg:gap-12 lg:px-8 lg:py-20">
            <div className="space-y-5 lg:pt-5">
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[.12em] text-indigo-700"><span aria-hidden="true">✦</span> Proposals · Signatures · Client Documents</p>
              <h1 className="max-w-2xl text-[clamp(2.5rem,4.3vw,4rem)] font-extrabold leading-[1.07] tracking-[-.055em] text-[#101A33]">Send one link.<br /><span className="text-indigo-600">Get your proposal signed, deposit paid, and client onboarded.</span></h1>
              <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">The white-labeled client portal for modern agencies.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200/70 transition hover:bg-indigo-700">Get started free <span className="ml-2" aria-hidden="true">→</span></Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50">See how it works</a>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-600"><span>✓ Free to get started</span><span>✓ No credit card required</span><span>✓ Simple client sharing</span></div>
            </div>
            <div className="relative min-w-0">
              <div className="absolute -inset-3 rounded-[2rem] bg-indigo-100/70 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-indigo-200 bg-white shadow-[0_20px_65px_-24px_rgba(67,56,202,.30)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2"><span className="rounded-lg bg-indigo-100 px-2 py-1 text-indigo-700">▤</span><span className="text-sm font-extrabold text-slate-900">Service Agreement</span></div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-800">Awaiting signature</span>
                </div>
                <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[130px_1fr]">
                  <div className="space-y-3 border-r border-slate-100 bg-slate-50 p-3 sm:p-4">
                    {["Proposal","Documents","Signature"].map((label,i)=><div key={label} className={`rounded-lg px-2 py-3 text-[10px] font-semibold sm:text-xs ${i===2?"bg-indigo-100 text-indigo-800":"text-slate-600"}`}>{label}</div>)}
                  </div>
                  <div className="min-w-0 p-5 sm:p-7">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Document preview · Sample</p>
                    <h2 className="mt-3 text-lg font-extrabold text-slate-950">Service agreement</h2>
                    <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-700">
                      <p><span className="font-bold text-slate-900">Prepared for:</span> Example Client</p>
                      <p><span className="font-bold text-slate-900">Scope:</span> Website design and delivery</p>
                      <p><span className="font-bold text-slate-900">Agreement:</span> Review the project scope, approve the terms, and sign to confirm acceptance.</p>
                    </div>
                    <div className="mt-8 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 p-4">
                      <p className="text-xs font-semibold text-slate-600">Client signature</p>
                      <svg viewBox="0 0 280 70" className="mt-2 h-16 w-full" role="img" aria-label="Illustrative handwritten signature">
                        <path d="M16 51 C38 15 40 15 36 46 C50 28 57 12 64 25 C70 44 48 56 91 36 C106 29 110 43 123 33 C137 15 149 58 170 30 C180 20 186 42 203 34 C216 28 230 24 252 37" fill="none" stroke="#4338CA" strokeWidth="3.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2"><span className="text-xs text-slate-500">Review · Sign · Complete</span><span className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">E-Signature</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="product" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">{t("sectionLabel")}</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t("sectionTitle")}</h2></div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map((item)=><article key={item.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-700">{item.icon}</div><h3 className="mt-5 text-lg font-extrabold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{item.copy}</p></article>)}
          </div>
        </section>

        <section className="border-y border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:gap-12 lg:px-8 lg:py-12">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.17em] text-indigo-700">Quick Sign</p>
              <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">Only need a signature? Skip the proposal.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">Upload a PDF, add signer details and share a private signing link. Your client can review and sign without creating an account.</p>
              <p className="mt-3 max-w-xl text-xs leading-6 text-slate-500">Beta: signatures are stored separately. Embedded signed PDFs and verified signer identity are not available yet.</p>
              <Link href="/signatures/new" className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700">Try Quick Sign <span aria-hidden="true" className="ml-2">→</span></Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-[0_18px_55px_-30px_rgba(79,70,229,.35)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><span className="text-sm font-bold text-slate-900">Signature request</span><span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-700">Illustrative preview</span></div>
              <div className="grid gap-4 p-5 sm:grid-cols-[1fr_.85fr]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center gap-2"><span className="rounded-lg bg-indigo-100 px-2 py-1 text-sm text-indigo-700">▤</span><span className="text-xs font-bold text-slate-800">Service agreement.pdf</span></div>
                  <div className="space-y-2 rounded-lg bg-white p-3 text-[11px] leading-5 text-slate-700">
                    <p className="font-bold text-slate-900">Service Agreement</p>
                    <p><span className="font-semibold">Client:</span> Example Client</p>
                    <p><span className="font-semibold">Project:</span> Website design</p>
                    <p>Review the scope and terms before signing.</p>
                  </div>
                  <div className="mt-6 rounded-lg border border-dashed border-indigo-300 bg-white px-3 py-4 text-center text-xs font-semibold text-indigo-600">Signature area</div>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Simple signing flow</p>
                  {["Upload your PDF","Share a private link","Client reviews and signs"].map((step,i)=><div key={step} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-extrabold text-indigo-700">{["↥","↗","✓"][i]}</span><span className="text-xs font-semibold text-slate-800">{step}</span></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <p className="text-center text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">How it works</p>
            <h2 className="mt-2 text-center text-2xl font-extrabold tracking-tight text-[#101A33] sm:text-3xl">From draft to signed deal in 3 simple steps.</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {steps.map((step)=><article key={step.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-extrabold text-indigo-700">{step.icon}</span>
                <div><h3 className="text-base font-extrabold text-[#101A33]">{step.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{step.copy}</p></div>
              </article>)}
            </div>
          </div>
        </section>
        <section id="pricing" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Built for agencies of every size</p><h2 className="mt-3 text-3xl font-extrabold text-slate-950 sm:text-4xl">Simple pricing. A premium client experience.</h2><p className="mt-3 text-sm text-slate-600">Start with three deals free, then upgrade when your agency grows.</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{[{name:"Starter",price:"$0",features:["3 deal rooms","SignDealDocs watermark"]},{name:"Pro",price:"$29",features:["Unlimited deal rooms","Custom logo and colors","No watermark"]},{name:"Agency",price:"$49",features:["Everything in Pro","Custom domain support"]}].map(plan=><article key={plan.name} className={`flex flex-col rounded-2xl border bg-white p-7 shadow-sm ${plan.name==="Pro"?"border-indigo-400 ring-1 ring-indigo-100":"border-slate-200"}`}><h3 className="text-xl font-extrabold">{plan.name}</h3><p className="mt-4 text-4xl font-extrabold">{plan.price}<span className="text-sm font-medium text-slate-500">/mo</span></p><ul className="my-7 flex-1 space-y-3">{plan.features.map(feature=><li key={feature} className="text-sm text-slate-600">✓ {feature}</li>)}</ul><Link href={plan.name==="Starter"?"/login":"/pricing"} className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-indigo-700">{plan.name==="Starter"?"Get started free":"Choose "+plan.name}</Link></article>)}</div><p className="mt-6 text-center"><Link href="/pricing" className="text-sm font-bold text-indigo-700 hover:underline">Compare all plans →</Link></p></section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Logo /><p className="mt-2 text-xs text-slate-500">{t("footerLine")}</p></div><div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500"><a href="mailto:hello@signdealdocs.com" className="hover:text-slate-900">{t("contact")}</a></div></div>
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>{t("copyright").replace("{year}", String(year))}</span><span>{t("footerLine")}</span></div>
        </div>
      </footer>
    </div>
  );
}
