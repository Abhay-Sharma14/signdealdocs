import {
  type Currency,
  type Deal,
  type DealStatus,
  isCurrency,
  isDealStatus,
} from "@/lib/types";

const LOCALES: Record<Currency, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  INR: "en-IN",
};

export function formatMoney(amount: number, currency: Currency) {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWhen(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function magicLink(slug: string) {
  return `https://signdealdocs.com/d/${slug}`;
}

export function makeSlug(title: string) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42) || "deal";
  const suffix = crypto.randomUUID().replace(/-/g, "");
  return `${base}-${suffix}`;
}

export function normalizeDocuments(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      return normalizeDocuments(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeDeal(row: Record<string, unknown>): Deal {
  const currencyRaw = String(row.currency ?? "USD");
  const statusRaw = String(row.status ?? "draft");
  const currency: Currency = isCurrency(currencyRaw) ? currencyRaw : "USD";
  const status: DealStatus = isDealStatus(statusRaw) ? statusRaw : "draft";

  return {
    id: String(row.id),
    slug: String(row.slug),
    client_name: String(row.client_name ?? ""),
    client_email: String(row.client_email ?? ""),
    project_title: String(row.project_title ?? ""),
    currency,
    amount: Number(row.amount ?? 0),
    status,
    signature_url: row.signature_url ? String(row.signature_url) : null,
    signed_at: row.signed_at ? String(row.signed_at) : null,
    created_at: String(row.created_at ?? ""),
    proposal: row.proposal ? String(row.proposal) : null,
    required_documents: normalizeDocuments(row.required_documents),
  };
}
