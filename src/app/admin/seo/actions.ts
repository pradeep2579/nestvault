"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, requireActor } from "@/lib/supabase";
import { cleanUrl, normalizeRedirectPath, redirectWouldLoop, validRedirectPath } from "@/lib/content";

export async function saveHomeSeo(formData: FormData) {
  await requireActor(true);
  const title = String(formData.get("title") || "").trim().slice(0, 180);
  const description = String(formData.get("description") || "").trim().slice(0, 320);
  if (!title || !description) throw new Error("Title and description are required");
  if (["canonical_url", "social_image"].some(key => String(formData.get(key) || "").trim() && !cleanUrl(String(formData.get(key)))))
    redirect("/admin/seo?error=url");
  let business: Record<string, unknown> = {};
  try { business = JSON.parse(String(formData.get("business_json") || "{}")); if (!business || Array.isArray(business) || typeof business !== "object") throw new Error(); }
  catch { redirect("/admin/seo?error=json"); }
  const { error } = await db().from("site_seo").upsert({ page_key: "home", title, description,
    canonical_url: cleanUrl(String(formData.get("canonical_url") || "")),
    social_image: cleanUrl(String(formData.get("social_image") || "")),
    social_image_alt: String(formData.get("social_image_alt") || "").trim() || null,
    noindex: formData.get("noindex") === "on", business_json: business, updated_at: new Date().toISOString() });
  if (error) throw error;
  revalidatePath("/"); revalidatePath("/sitemap.xml");
  redirect("/admin/seo?saved=1");
}

export async function addRedirect(formData: FormData) {
  await requireActor(true);
  const source = normalizeRedirectPath(String(formData.get("source_path") || ""));
  const destination = normalizeRedirectPath(String(formData.get("destination_path") || ""));
  if (!validRedirectPath(source) || !validRedirectPath(destination) || source === destination) redirect("/admin/seo?error=path");
  const { data: existing } = await db().from("redirects").select("source_path,destination_path");
  if (redirectWouldLoop(existing || [], source, destination)) redirect("/admin/seo?error=loop");
  const { error } = await db().from("redirects").insert({ source_path: source, destination_path: destination, permanent: formData.get("permanent") === "on" });
  if (error) redirect("/admin/seo?error=duplicate");
  redirect("/admin/seo?saved=1");
}

export async function removeRedirect(formData: FormData) {
  await requireActor(true);
  const id = String(formData.get("id") || "");
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Invalid redirect");
  const { error } = await db().from("redirects").delete().eq("id", id);
  if (error) throw error;
  redirect("/admin/seo?saved=1");
}
