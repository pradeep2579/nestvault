"use server";
import { redirect } from "next/navigation";
import { db, requireActor } from "@/lib/supabase";
import { normalizeSearchSite } from "@/lib/analytics";

export async function saveAnalyticsSettings(formData: FormData) {
  await requireActor(true);
  const searchSite = normalizeSearchSite(String(formData.get("search_site") || ""));
  const property = String(formData.get("ga4_property_id") || "").trim().replace(/^properties\//i, "");
  // Bad input goes back to the page as a message instead of crashing it.
  if (searchSite === null) redirect("/admin/analytics?error=search_site");
  if (property && !/^\d+$/.test(property)) redirect("/admin/analytics?error=ga4_property");
  const { error } = await db().from("integrations").update({ search_site: searchSite || null, ga4_property_id: property || null }).eq("name", "google");
  if (error) redirect("/admin/analytics?error=save");
  redirect("/admin/analytics?saved=1");
}

export async function disconnectGoogle() {
  await requireActor(true);
  const { error } = await db().from("integrations").delete().eq("name", "google");
  if (error) throw new Error("Could not disconnect Google. Try again.");
  redirect("/admin/analytics?disconnected=1");
}
