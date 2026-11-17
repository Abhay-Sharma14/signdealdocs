"use client";

import { SUPPORTED_LOCALES } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  return (
    <label className={compact ? "inline-flex items-center" : "inline-flex items-center gap-2"}>
      {!compact && <span className="text-xs font-semibold text-slate-500">Language</span>}
      <select
        aria-label="Choose language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        className="max-w-[175px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      >
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item.code} value={item.code}>{item.flag} {item.label}</option>
        ))}
      </select>
    </label>
  );
}
