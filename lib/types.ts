export const CURRENCIES = ["USD", "EUR", "GBP", "INR"] as const;

export type Currency = (typeof CURRENCIES)[number];

export const DEAL_STATUSES = ["draft", "sent", "signed", "completed"] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

export type Deal = {
  id: string;
  slug: string;
  client_name: string;
  client_email: string;
  project_title: string;
  currency: Currency;
  amount: number;
  status: DealStatus;
  signature_url: string | null;
  signed_at: string | null;
  created_at: string;
  proposal: string | null;
  required_documents: string[];
};

export type DealDocument = {
  id: string;
  deal_id: string;
  document_label: string;
  file_name: string;
  file_url: string;
  created_at: string;
};

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

export function isDealStatus(value: string): value is DealStatus {
  return (DEAL_STATUSES as readonly string[]).includes(value);
}
