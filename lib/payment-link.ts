/** Validate external payment URLs before storing or displaying them. */
export function validatePaymentLink(value: string): string | null {
  const raw = value.trim();
  if (!raw || raw.length > 2048) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    if (!host.includes(".") || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return null;
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host.startsWith("[") || host.endsWith(".onion")) return null;
    if (/\s/.test(raw)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
