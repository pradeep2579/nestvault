// Helpers for the admin Analytics page. Kept free of server-only imports so they can be tested.

const day = 86_400_000;
const isoDate = (time: number) => new Date(time).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// Search Console data lags by about 3 days, so both reports end 3 days ago and cover the same `days` days.
export function reportWindow(days: number, now = Date.now()) {
  const end = now - 3 * day;
  return { startDate: isoDate(end - (days - 1) * day), endDate: isoDate(end) };
}

// Shows real zeros as 0 and missing values as a dash, with Indian digit grouping.
export function formatCount(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-IN") : "—";
}

// Google error bodies look like { error: { message, status } }; keep the reason so admins can fix the setup.
export function googleErrorMessage(status: number, body: unknown) {
  const error = (body as { error?: { message?: unknown; status?: unknown } } | null)?.error;
  const reason = typeof error?.message === "string" ? error.message.trim().slice(0, 300) : "";
  const hint = status === 401 ? " Reconnect Google." : status === 403 ? " Check that the connected account can access this property and that the API is enabled in Google Cloud." : "";
  return `Google reporting request failed (${status})${reason ? `: ${reason}` : "."}${hint}`;
}

// Reads the 32-byte Google token key. Accepts base64 (openssl rand -base64 32) or hex (openssl rand -hex 32),
// and ignores spaces, line breaks and wrapping quotes that often sneak in when pasting into hosting settings.
export function parseTokenKey(raw: string | undefined) {
  const value = (raw || "").replace(/\s+/g, "").replace(/^(["'])(.*)\1$/, "$2");
  if (!value) return null;
  const key = /^[0-9a-f]{64}$/i.test(value) ? Buffer.from(value, "hex")
    : /^[A-Za-z0-9+/_-]+={0,2}$/.test(value) ? Buffer.from(value, "base64") : null;
  return key?.length === 32 ? key : null;
}
