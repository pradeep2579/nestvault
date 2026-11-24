// Plain helpers (no server imports) so the editor, the article list and the SEO audit all judge an article the same way.
export type SeoPost = { title: string; slug: string; excerpt?: string | null; body_html?: string | null; seo_title?: string | null; seo_description?: string | null;
  cover_url?: string | null; cover_alt?: string | null; noindex?: boolean | null };
export type SeoCheck = { id: string; ok: boolean; label: string; hint: string };

const textOf = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
export const wordCount = (html: string | null | undefined) => { const text = textOf(html || ""); return text ? text.split(" ").length : 0; };
export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 200));

export function postSeoChecks(post: SeoPost): SeoCheck[] {
  const html = post.body_html || "";
  const title = (post.seo_title || post.title || "").trim();
  const description = (post.seo_description || post.excerpt || "").trim();
  const images = html.match(/<img\b[^>]*>/gi) || [];
  const missingAlt = images.filter(tag => !/\balt\s*=\s*"[^"]+"/i.test(tag)).length;
  const internal = /<a\b[^>]*href\s*=\s*"(?:\/(?!\/)|https?:\/\/(?:www\.)?nestvault\.in)/i.test(html);
  return [
    { id: "title", ok: title.length >= 30 && title.length <= 65, label: `Search title is 30-65 characters (now ${title.length})`, hint: "Google cuts long titles off; very short ones waste space." },
    { id: "description", ok: description.length >= 110 && description.length <= 160, label: `Meta description is 110-160 characters (now ${description.length})`, hint: "This is the text people read under your link in search." },
    { id: "cover", ok: !!post.cover_url && !!(post.cover_alt || "").trim(), label: "Cover image with alt text", hint: "Improves sharing previews and accessibility." },
    { id: "length", ok: wordCount(html) >= 300, label: `At least 300 words (now ${wordCount(html)})`, hint: "Very short articles rarely rank." },
    { id: "headings", ok: /<h2\b/i.test(html), label: "Has at least one heading", hint: "Headings help readers and search engines scan the article." },
    { id: "alt", ok: missingAlt === 0, label: missingAlt ? `${missingAlt} image${missingAlt > 1 ? "s" : ""} missing alt text` : "All images have alt text", hint: "Describe each image in words." },
    { id: "links", ok: internal, label: "Links to another Nest Vault page", hint: "Internal links keep readers on your site." },
    { id: "slug", ok: !!post.slug && post.slug.length <= 60, label: "Short, readable URL", hint: "Keep the slug under 60 characters." },
    { id: "indexable", ok: !post.noindex, label: "Visible to search engines", hint: "This article is hidden from Google." },
  ];
}

export const seoIssues = (post: SeoPost) => postSeoChecks(post).filter(check => !check.ok);
