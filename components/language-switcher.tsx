"use client";

import { useEffect, useRef, useState } from "react";
import { SUPPORTED_LOCALES, type LocaleCode } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";

const flagCountry: Record<LocaleCode, string> = {
  "en-US": "us",
  "en-GB": "gb",
  "nl-NL": "nl",
  "fr-FR": "fr",
  "zh-CN": "cn",
  "da-DK": "dk",
  "ja-JP": "jp",
  "hi-IN": "in",
};

function CountryFlag({ code }: { code: LocaleCode }) {
  const country = flagCountry[code];
  return (
    <span
      aria-hidden="true"
      className="inline-block h-[15px] w-[22px] shrink-0 rounded-[2px] border border-slate-200 bg-white bg-cover bg-center shadow-sm"
      style={{ backgroundImage: `url(https://flagcdn.com/w40/${country}.png)` }}
    />
  );
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = SUPPORTED_LOCALES.find((item) => item.code === locale) ?? SUPPORTED_LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={`Choose language. Current: ${selected.label}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={compact
          ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-lg transition hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:h-10 sm:w-10"
          : "inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-indigo-600"}
      >
        <CountryFlag code={selected.code} />
        {!compact && <span>{selected.label}</span>}
        {!compact && <span aria-hidden="true" className="text-xs text-slate-500">⌄</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[80] mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_45px_rgba(15,23,42,.16)]" role="group" aria-label="Available languages">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Language</p>
          <div className="max-h-[min(65vh,420px)] overflow-y-auto">
            {SUPPORTED_LOCALES.map((item) => (
              <button
                key={item.code}
                type="button"
                aria-current={locale === item.code ? "true" : undefined}
                onClick={() => { setLocale(item.code as LocaleCode); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-indigo-600 ${locale === item.code ? "bg-violet-50 font-semibold text-indigo-900" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <CountryFlag code={item.code} />
                <span className="flex-1">{item.label}</span>
                {locale === item.code && <span aria-hidden="true" className="text-indigo-600">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
