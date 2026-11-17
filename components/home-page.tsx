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
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {steps.map((step)=><article key={step.number} className="rounded-2xl bg-slate-50 p-6"><p className="font-mono text-xs font-bold text-indigo-600">{step.number}</p><h3 className="mt-3 text-lg font-extrabold text-slate-950">{step.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{step.copy}</p></article>)}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-indigo-600">{t("pricingEyebrow")}</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t("pricingTitle")}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{t("pricingCopy")}</p></div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-indigo-200 bg-white p-7 shadow-sm"><p className="text-sm font-bold text-indigo-700">{t("free")}</p><p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">{t("freePrice")}<span className="ml-2 text-sm font-semibold text-slate-500">/ forever</span></p><p className="mt-3 text-sm text-slate-600">{t("freeDesc")}</p><Link href="/login" className="mt-6 inline-flex w-full justify-center rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-[#4338ca]">{t("freeCta")}</Link></article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-7"><p className="text-sm font-bold text-slate-700">{t("fair")}</p><p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">{t("fairPrice")}</p><p className="mt-3 text-sm text-slate-600">{t("fairDesc")}</p><div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-600">{t("fairCta")}</div></article>
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-6 text-slate-500">{t("pricingNote")}</p>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Logo /><p className="mt-2 text-xs text-slate-500">{t("footerLine")}</p></div><div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500"><a href="mailto:hello@signdealdocs.com" className="hover:text-slate-900">{t("contact")}</a><a href="/privacy" className="hover:text-slate-900">{t("privacy")}</a><a href="/terms" className="hover:text-slate-900">{t("terms")}</a></div></div>
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>{t("copyright").replace("{year}", String(year))}</span><span>{t("footerLine")}</span></div>
        </div>
      </footer>
    </div>
  );
}
