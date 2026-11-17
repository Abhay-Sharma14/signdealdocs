"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";

export default function HomePage() {
  const { t, formatCurrency } = useLocale();
  const year = new Date().getFullYear();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [billingCountry, setBillingCountry] = useState<"IN" | "US" | "GB" | "EU" | "OTHER">("US");
  const features = [
    { number: "01", icon: "✦", title: t("feature1"), copy: t("feature1d") },
    { number: "02", icon: "✍", title: t("feature2"), copy: t("feature2d") },
    { number: "03", icon: "▤", title: t("feature3"), copy: t("feature3d") },
  ];
  const steps = [
    { number: "01", title: t("how1"), copy: t("how1d") },
    { number: "02", title: t("how2"), copy: t("how2d") },
    { number: "03", title: t("how3"), copy: t("how3d") },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo href="/" />
          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            <div className="relative">
              <button type="button" aria-expanded={platformOpen} aria-controls="platform-menu" onClick={() => setPlatformOpen(!platformOpen)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-700">Platform <span aria-hidden="true" className={platformOpen ? "rotate-180 transition-transform" : "transition-transform"}>⌄</span></button>
              {platformOpen && <div id="platform-menu" className="absolute left-0 top-full mt-4 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <a href="#product" onClick={() => setPlatformOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-indigo-50">AI proposals <span className="block text-xs font-normal text-slate-500">Create and share proposals</span></a>
                <Link href="/signatures/new" onClick={() => setPlatformOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-indigo-50">E-Signatures <span className="block text-xs font-normal text-slate-500">Request a PDF signature</span></Link>
                <a href="#how-it-works" onClick={() => setPlatformOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-indigo-50">Client workspace <span className="block text-xs font-normal text-slate-500">Documents and deal workflow</span></a>
              </div>}
            </div>
            <Link href="/signatures/new" className="text-sm font-semibold text-slate-700 hover:text-indigo-700">E-Signatures</Link>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-indigo-700">{t("navHow")}</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-700 hover:text-indigo-700">{t("navPricing")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><LanguageSwitcher compact /></div>
            <Link href="/login" className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 md:inline-flex">{t("login")}</Link>
            <Link href="/login" className="hidden rounded-xl bg-[#4338CA] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#3730A3] sm:inline-flex">Get started free</Link>
            <button type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-800 lg:hidden">{mobileMenuOpen ? "×" : "☰"}</button>
          </div>
        </div>
        {mobileMenuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <a href="#product" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">Platform</a>
            <Link href="/signatures/new" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">E-Signatures</Link>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">{t("navHow")}</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800">{t("navPricing")}</a>
            <div className="px-3 py-2"><LanguageSwitcher compact /></div>
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
              <h1 className="max-w-2xl text-[clamp(2.5rem,4.3vw,4rem)] font-extrabold leading-[1.07] tracking-[-.055em] text-[#101A33]">Create proposals.<br />Get signatures.<br /><span className="text-indigo-600">Close deals.</span></h1>
              <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">Create professional proposals, request electronic signatures and manage client documents in one simple workspace.</p>
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
                    <div className="mt-5 space-y-3">
                      {["w-full","w-11/12","w-4/5","w-full","w-3/5"].map((w,i)=><div key={i} className={`h-2 rounded-full bg-slate-200 ${w}`}/>)}
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
              <p className="text-xs font-extrabold uppercase tracking-[.17em] text-indigo-700">Standalone E-Signature</p>
              <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">Only need a signature? Skip the proposal.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">Upload a PDF, add signer details and share a private signing link. Your client can review and sign without creating an account.</p>
              <p className="mt-3 max-w-xl text-xs leading-6 text-slate-500">Beta: signatures are stored separately. Embedded signed PDFs and verified signer identity are not available yet.</p>
              <Link href="/signatures/new" className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700">Request an E-Signature <span aria-hidden="true" className="ml-2">→</span></Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-[0_18px_55px_-30px_rgba(79,70,229,.35)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><span className="text-sm font-bold text-slate-900">Signature request</span><span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-700">Illustrative preview</span></div>
              <div className="grid gap-4 p-5 sm:grid-cols-[1fr_.85fr]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center gap-2"><span className="rounded-lg bg-indigo-100 px-2 py-1 text-sm text-indigo-700">▤</span><span className="text-xs font-bold text-slate-800">Service agreement.pdf</span></div>
                  <div className="space-y-2"><div className="h-2 w-4/5 rounded-full bg-slate-200"/><div className="h-2 w-full rounded-full bg-slate-200"/><div className="h-2 w-3/4 rounded-full bg-slate-200"/><div className="mt-4 h-2 w-5/6 rounded-full bg-slate-200"/><div className="h-2 w-2/3 rounded-full bg-slate-200"/></div>
                  <div className="mt-6 rounded-lg border border-dashed border-indigo-300 bg-white px-3 py-4 text-center text-xs font-semibold text-indigo-600">Signature area</div>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Simple signing flow</p>
                  {["Upload your PDF","Share a private link","Client reviews and signs"].map((step,i)=><div key={step} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-extrabold text-indigo-700">{i+1}</span><span className="text-xs font-semibold text-slate-800">{step}</span></div>)}
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
              {steps.map((step,index)=><article key={step.number} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-extrabold text-indigo-700">{index+1}</span>
                <div><h3 className="text-base font-extrabold text-[#101A33]">{step.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{step.copy}</p></div>
              </article>)}
            </div>
          </div>
        </section>
        <section id="pricing" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">{t("pricingEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t("pricingTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t("pricingCopy")}</p>
            <p className="mt-3 inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">Preview pricing · Paid subscriptions are not yet available</p>
          </div>
          <div className="mx-auto mt-7 flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <label htmlFor="billing-country" className="text-sm font-semibold text-slate-700">Billing country</label>
            <select id="billing-country" value={billingCountry} onChange={(event) => setBillingCountry(event.target.value as typeof billingCountry)} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
              <option value="IN">India (INR)</option>
              <option value="US">United States (USD)</option>
              <option value="GB">United Kingdom (GBP)</option>
              <option value="EU">Europe (EUR)</option>
              <option value="OTHER">Other countries</option>
            </select>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              { name: t("free"), price: "$0", india: "₹0", subtitle: "Explore the workflow", features: ["Create and review proposals", "Share a client deal link", "Collect signatures and documents"], featured: false, available: true },
              { name: "Pro", price: "$9.99", india: "₹599", subtitle: "For professionals and growing businesses", features: ["Everything in Free", "More deals and AI proposals (planned)", "Reusable templates (planned)", "Signature audit history (planned)"], featured: true, available: false },
              { name: "Business", price: "$24.99", india: "₹1,499", subtitle: "For growing teams", features: ["Everything in Pro", "Team workspaces and roles (planned)", "Advanced reporting (planned)"], featured: false, available: false },
            ].map((plan) => (
              <article key={plan.name} className={`relative flex flex-col rounded-[1.5rem] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${plan.featured ? "border-indigo-400 bg-gradient-to-b from-violet-50 to-white ring-1 ring-indigo-200" : "border-slate-200 bg-white"}`}>
                {plan.featured && <span className="absolute -top-3 left-5 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white">Popular option</span>}
                <h3 className="text-lg font-extrabold text-slate-950">{plan.name}</h3>
                <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{plan.subtitle}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-950">{billingCountry === "IN" ? plan.india : billingCountry === "US" ? plan.price : plan.available ? "Free" : "Coming soon"}</span>
                  {(billingCountry === "IN" || billingCountry === "US") && <span className="text-xs text-slate-500">/ month</span>}
                </div>
                
                <div className="my-5 border-t border-slate-100" />
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm leading-6 text-slate-600"><span className="shrink-0 font-bold text-indigo-600">✓</span><span>{feature}</span></li>)}
                </ul>
                {plan.available ? (
                  <Link href="/login" className="mt-7 inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">{t("freeCta")}</Link>
                ) : (
                  <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-500">Coming soon</div>
                )}
              </article>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-6 text-slate-500">
            Preview pricing only. Paid subscriptions are not yet available. Prices, features and taxes may change before launch.
          </p>
        </section>

        <section className="bg-slate-950">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-2xl"><h2 className="text-2xl font-extrabold text-white sm:text-3xl">{t("globalTitle")}</h2><p className="mt-2 text-sm leading-7 text-slate-300">{t("globalCopy")}</p></div>
            <div className="rounded-xl bg-white p-2"><LanguageSwitcher /></div>
          </div>
        </section>
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
