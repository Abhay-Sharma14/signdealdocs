"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { messages, SUPPORTED_LOCALES, type LocaleCode, type MessageKey } from "@/lib/i18n";

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: MessageKey) => string;
  formatCurrency: (amount: number) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "signdealdocs-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en-US");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.some((item) => item.code === saved)) {
      setLocaleState(saved as LocaleCode);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const dictionary = messages[locale] ?? messages["en-US"];
    const currency = SUPPORTED_LOCALES.find((item) => item.code === locale)?.currency ?? "USD";
    return {
      locale,
      setLocale: (next) => {
        setLocaleState(next);
        window.localStorage.setItem(STORAGE_KEY, next);
      },
      t: (key) => dictionary[key] ?? messages["en-US"][key],
      formatCurrency: (amount) => new Intl.NumberFormat(locale, {
        style: "currency", currency, maximumFractionDigits: currency === "JPY" ? 0 : 2,
      }).format(amount),
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
