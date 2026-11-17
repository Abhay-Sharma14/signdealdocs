"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { messages, SUPPORTED_LOCALES, type LocaleCode, type MessageKey } from "@/lib/i18n";

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: MessageKey) => string;
  formatCurrency: (amount: number) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "signdealdocs-locale";
const LOCALE_EVENT = "signdealdocs:locale-change";
const DEFAULT_LOCALE: LocaleCode = "en-US";

function isLocaleCode(value: string | null): value is LocaleCode {
  return value !== null && SUPPORTED_LOCALES.some((item) => item.code === value);
}

function getLocaleSnapshot(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isLocaleCode(saved) ? saved : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function subscribeToLocaleChanges(onChange: () => void) {
  window.addEventListener(LOCALE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(LOCALE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getServerLocaleSnapshot(): LocaleCode {
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocaleChanges,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const dictionary = messages[locale] ?? messages["en-US"];
    const currency = SUPPORTED_LOCALES.find((item) => item.code === locale)?.currency ?? "USD";

    return {
      locale,
      setLocale: (next) => {
        if (!isLocaleCode(next)) return;

        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // The selected locale still updates for this tab if storage is unavailable.
        }

        window.dispatchEvent(new Event(LOCALE_EVENT));
      },
      t: (key) => dictionary[key] ?? messages["en-US"][key],
      formatCurrency: (amount) =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          maximumFractionDigits: currency === "JPY" ? 0 : 2,
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
