import sanitizeHtml from "sanitize-html";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nestvault.in";
export const stages = ["new", "contacted", "tour_scheduled", "tour_completed", "won", "lost"] as const;
export type Stage = typeof stages[number];

export function safeHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "h1", "h2", "h3", "img"],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, a: ["href", "target", "rel"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

export function absoluteUrl(path: string) {
  try { return new URL(path, siteUrl).toString(); } catch { return siteUrl; }
}

export function cleanUrl(value: string) {
  const raw = value.trim();
  if (!raw) return null;
  if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\")) return raw;
  try { const parsed = new URL(raw); return parsed.protocol === "https:" ? parsed.toString() : null; }
  catch { return null; }
}

export function isLivePost(post: { status: string; published_at: string | null }, now = new Date()) {
  return (post.status === "published" || post.status === "scheduled") && !!post.published_at && new Date(post.published_at) <= now;
}

export function canEditPost(actor: { id: string; role: "owner" | "staff" }, post: { author_id: string | null; status: string; published_at: string | null }, now = new Date()) {
  return actor.role === "owner" || (post.author_id === actor.id && !isLivePost(post, now));
}

export function normalizeRedirectPath(path: string) { return path.trim().replace(/\/$/, "") || "/"; }

export function validRedirectPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !/[?#\\\x00-\x1f]/.test(value)
    && !["/robots.txt", "/sitemap.xml", "/manifest.json", "/favicon.ico", "/icon.png", "/apple-icon.png"].includes(value)
    && !["/admin", "/api", "/login", "/_next", "/images", "/videos"].some(prefix => value === prefix || value.startsWith(`${prefix}/`));
}

export function redirectWouldLoop(rows: { source_path: string; destination_path: string }[], source: string, destination: string) {
  const destinations = new Map(rows.map(item => [item.source_path, item.destination_path]));
  const seen = new Set([source]);
  let next = destination;
  while (destinations.has(next)) {
    if (seen.has(next)) return true;
    seen.add(next);
    next = destinations.get(next)!;
  }
  return seen.has(next);
}
