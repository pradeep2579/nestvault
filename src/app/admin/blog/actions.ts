"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, requireActor } from "@/lib/supabase";
import { canEditPost, cleanUrl, safeHtml, slugify } from "@/lib/content";

export async function savePost(formData: FormData) {
  const current = await requireActor();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 180);
  const slug = slugify(String(formData.get("slug") || title));
  const excerpt = String(formData.get("excerpt") || "").trim().slice(0, 500);
  const body = safeHtml(String(formData.get("body_html") || ""));
  const coverUrl = cleanUrl(String(formData.get("cover_url") || ""));
  const coverAlt = String(formData.get("cover_alt") || "").trim().slice(0, 180);
  const intent = String(formData.get("intent") || "draft");
  const editPath = id ? `/admin/blog/${id}` : "/admin/blog/new";
  if (!title || !slug || !["draft", "publish", "schedule"].includes(intent)) redirect(`${editPath}?error=article`);
  if (["cover_url", "canonical_url", "social_image"].some(key => String(formData.get(key) || "").trim() && !cleanUrl(String(formData.get(key)))))
    redirect(`${editPath}?error=url`);
  if (intent !== "draft" && current.role !== "owner") throw new Error("Only owners can publish");
  if (intent !== "draft" && coverUrl && !coverAlt) redirect(`${editPath}?error=alt`);
  const old = id ? (await db().from("posts").select("status,slug,published_at,author_id").eq("id", id).maybeSingle()).data : null;
  if (id && !old) throw new Error("Article not found");
  if (old && !canEditPost(current, old))
    throw new Error("Only owners can edit published articles");
  const schedule = String(formData.get("published_at") || "");
  const scheduleTime = intent === "schedule" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(schedule)
    ? Date.parse(`${schedule}+05:30`) : NaN;
  if (intent === "schedule" && (!Number.isFinite(scheduleTime) || scheduleTime <= Date.now())) redirect(`${editPath}?error=schedule`);
  const publishedAt = intent === "publish" ? new Date().toISOString() : intent === "schedule" ? new Date(scheduleTime).toISOString() : null;
  const status = intent === "publish" ? "published" : intent === "schedule" ? "scheduled" : "draft";
  const payload = { title, slug, excerpt, body_html: body, status, published_at: publishedAt,
    cover_url: coverUrl,
    cover_alt: coverAlt || null,
    seo_title: String(formData.get("seo_title") || "").slice(0, 180) || null,
    seo_description: String(formData.get("seo_description") || "").slice(0, 320) || null,
    canonical_url: cleanUrl(String(formData.get("canonical_url") || "").slice(0, 1000)),
    social_image: cleanUrl(String(formData.get("social_image") || "").slice(0, 1000)),
    noindex: formData.get("noindex") === "on", schema_type: "BlogPosting",
    updated_at: new Date().toISOString() };
  const client = db();
  const result = id ? await client.from("posts").update(payload).eq("id", id).select("id").single()
    : await client.from("posts").insert({ ...payload, author_id: current.id }).select("id").single();
  if (result.error) {
    if (result.error.code === "23505") redirect(`${editPath}?error=slug`);
    throw result.error;
  }
  revalidatePath("/"); revalidatePath("/blog"); revalidatePath("/sitemap.xml");
  if (old?.slug) revalidatePath(`/blog/${old.slug}`);
  revalidatePath(`/blog/${slug}`);
  redirect(`/admin/blog/${result.data.id}?saved=1`);
}
