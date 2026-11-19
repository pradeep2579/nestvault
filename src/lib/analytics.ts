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

// Turns what admins type into a Search Console site ID: "nestvault.in" or "www.nestvault.in" becomes a domain
// property (sc-domain:nestvault.in); full URLs become URL-prefix properties ending in "/". Returns null if unusable.
export function normalizeSearchSite(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  const domain = /^sc-domain:/i.test(value) ? value.slice(10) : /^https?:\/\//i.test(value) ? null : value;
  if (domain !== null) {
    const host = domain.trim().toLowerCase().replace(/\/+$/, "").replace(/^www\./, "");
    return /^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host) ? `sc-domain:${host}` : null;
  }
  try {
    const url = new URL(value);
    return url.hostname.includes(".") ? `${url.protocol}//${url.host}${url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`}` : null;
  } catch { return null; }
}

// Every date in the report window, as YYYY-MM-DD, so charts show days with no visits as 0.
export function windowDates(startDate: string, endDate: string) {
  const dates: string[] = [];
  for (let time = Date.parse(`${startDate}T00:00:00Z`); time <= Date.parse(`${endDate}T00:00:00Z`); time += day) dates.push(new Date(time).toISOString().slice(0, 10));
  return dates;
}

// Lines up report rows (GA4 dates look like 20261020, Search Console like 2026-10-20) with the window's dates.
export function dailySeries(dates: string[], rows: { date: string; value: number }[]) {
  const values = new Map<string, number>();
  for (const row of rows) {
    const date = row.date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
    values.set(date, (values.get(date) || 0) + row.value);
  }
  return dates.map(date => ({ date, value: values.get(date) || 0 }));
}

// SVG path data for a line and the area under it, scaled so the largest value touches the top.
export function chartPath(values: number[], width: number, height: number, pad = 6) {
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => ({
    x: values.length > 1 ? (index * width) / (values.length - 1) : width / 2,
    y: pad + (height - 2 * pad) * (1 - value / max),
  }));
  const line = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const area = points.length ? `${line} L${points[points.length - 1].x.toFixed(1)} ${height} L${points[0].x.toFixed(1)} ${height} Z` : "";
  return { line, area, points, max };
}

// Share of the total for each value, plus where each slice starts, for donut and stacked-bar charts.
export function shares(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  let start = 0;
  return values.map(value => {
    const share = total ? value / total : 0;
    const slice = { share, start };
    start += share;
    return slice;
  });
}

export function percent(part: number, whole: number, digits = 1) {
  return whole > 0 ? `${((part / whole) * 100).toFixed(digits)}%` : "—";
}
