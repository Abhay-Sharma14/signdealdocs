"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";

export default function HomePage() {
  const { t, formatCurrency } = useLocale();
  const year = new Date().getFullYear();
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
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#product" className="text-sm font-semibold text-slate-600 hover:text-slate-950">{t("navProduct")}</a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-slate-950">{t("navHow")}</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-950">{t("navPricing")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex">{t("login")}</Link>
            <Link href="/login" className="rounded-xl bg-brand px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#4338ca] sm:px-4 sm:text-sm">{t("start")}</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative isolate">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_10%,rgba(99,102,241,.13),transparent_42%),radial-gradient(ellipse_at_85%_35%,rgba(16,185,129,.10),transparent_38%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-28">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] text-indigo-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {t("eyebrow")}
              </div>
              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-[-.045em] text-slate-950 sm:text-5xl lg:text-[3.65rem]">{t("title")}</h1>
              <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{t("subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-[#4338ca]">{t("primary")} <span className="ml-2">→</span></Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">{t("secondary")}</a>
              </div>
              <p className="text-xs font-medium text-slate-500">✓ {t("trust")}</p>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-200/60 via-white to-emerald-100/70 blur-2xl" />
              <article className="relative overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,.32)]">
                <div className="bg-slate-950 px-6 py-6 text-white sm:px-8">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-200">{t("preview")}</p>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">● Secure workspace</span>
                  </div>
                  <h2 className="mt-5 text-2xl font-extrabold leading-tight sm:text-3xl">{t("previewTitle")}</h2>
                  <p className="mt-2 text-sm text-slate-300">{t("prepared")}</p>
                </div>
                <div className="space-y-5 p-6 sm:p-8">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-white">
                    <span className="text-sm font-medium text-slate-300">{t("investment")}</span>
                    <span className="text-2xl font-extrabold tracking-tight">{formatCurrency(3200)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[t("review"),t("sign"),t("upload")].map((label,index)=><div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center"><span className="block text-[10px] font-bold text-indigo-600">0{index+1}</span><span className="mt-1 block text-xs font-bold text-slate-800">{label}</span></div>)}
                  </div>
                  <p className="text-xs leading-6 text-slate-500">One link. One clear process. Less chasing and fewer scattered emails.</p>
                </div>
              </article>
              <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block"><p className="text-xs font-bold text-slate-900">✓ Deal workflow</p><p className="mt-0.5 text-[10px] text-slate-500">Proposal · Agreement · Documents</p></div>
            </div>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">{t("sectionLabel")}</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t("sectionTitle")}</h2></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((item)=><article key={item.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-700">{item.icon}</div><h3 className="mt-5 text-lg font-extrabold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{item.copy}</p></article>)}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200/70 bg-white/70">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t("howTitle")}</h2>
            <div className="relative mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
              {steps.map((step, index) => (
                <article
                  key={step.number}
                  className="group relative flex min-h-[240px] flex-col rounded-[1.5rem] border border-slate-200/90 bg-white p-6 shadow-[0_12px_35px_-25px_rgba(44,38,119,.35)] transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_45px_-24px_rgba(78,61,187,.35)] sm:p-7"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-700">
                      {index === 0 ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z"/><path d="M13 3v7h7M8 15h8M8 18h5"/></svg>
                      ) : index === 1 ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                      ) : (
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7 10 17l-5-5"/><path d="M12 3a9 9 0 1 0 9 9"/></svg>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-50 px-3 py-1 font-mono text-xs font-bold tracking-wider text-indigo-600">{step.number} / 03</span>
                  </div>
                  <h3 className="mt-7 text-xl font-extrabold tracking-tight text-slate-950">{step.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-7 text-slate-600">{step.copy}</p>
                  <div className="mt-auto pt-6">
                    <div className="h-1 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-400 transition-all duration-300 group-hover:w-20" />
                  </div>
                  {index < 2 && (
                    <span aria-hidden="true" className="absolute -right-[25px] top-[62px] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-indigo-100 bg-white text-indigo-600 shadow-sm md:flex">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
                    </span>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">{t("pricingEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t("pricingTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t("pricingCopy")}</p>
            <p className="mt-3 inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">Paid plans are a preview · Subscriptions are not available yet</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { name: t("free"), price: "$0", india: "₹0", subtitle: "Explore the workflow", features: ["Create and review proposals", "Share a client deal link", "Collect signatures and documents"], featured: false, available: true },
              { name: "Starter", price: "$4.99", india: "₹299", subtitle: "For independent professionals", features: ["Everything in Free", "More deals and AI proposals (planned)", "Reusable proposal templates (planned)"], featured: false, available: false },
              { name: "Professional", price: "$12.99", india: "₹799", subtitle: "For busy freelancers and agencies", features: ["Everything in Starter", "Signature audit history (planned)", "Client-link controls (planned)"], featured: true, available: false },
              { name: "Business", price: "$24.99", india: "₹1,499", subtitle: "For growing teams", features: ["Everything in Professional", "Team workspaces and roles (planned)", "Advanced reporting (planned)"], featured: false, available: false },
            ].map((plan) => (
              <article key={plan.name} className={`relative flex flex-col rounded-[1.5rem] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${plan.featured ? "border-indigo-400 bg-gradient-to-b from-violet-50 to-white ring-1 ring-indigo-200" : "border-slate-200 bg-white"}`}>
                {plan.featured && <span className="absolute -top-3 left-5 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white">Popular option</span>}
                <h3 className="text-lg font-extrabold text-slate-950">{plan.name}</h3>
                <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{plan.subtitle}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-950">{plan.price}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{plan.india} / month in India · indicative</p>
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
            Proposed monthly prices shown in USD, with indicative India pricing. Final pricing, quotas, feature availability, taxes, and billing terms will be confirmed before subscriptions launch. No paid checkout is active.
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
